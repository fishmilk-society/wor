import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData'
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData'
import { ActiveEffectData, ChatMessageData, TokenData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { expect, unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'
import { getOwner } from '../helpers/get-owner'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'

declare global
{
    interface DocumentClassConfig
    {
        ActiveEffect: typeof StatusEffect
    }

    interface FlagConfig
    {
        ActiveEffect: {
            wor?: {
                expired?: boolean
                initiative?: number
            }
        }

        ChatMessage: {
            wor?: {
                associatedEffectId?: string
            }
        }
    }
}

import template from './StatusEffect.hbs'

export class Asd extends ActiveEffectConfig
{
    static override get defaultOptions(): ActiveEffectConfig.Options
    {
        return {
            ...super.defaultOptions,
            template
        }
    }

    override async getData(options?: Application.RenderOptions): Promise<Asd.Data>
    {
        const context: Asd.Data = await super.getData(options)

        const d = context.data.duration
        if (d.seconds)
            d.string = Duration.fromSeconds(d.seconds).toString()
        else
            d.string = ''

        return { ...context }
    }

    protected override _updateObject(event: any, formData: any)
    {
        const d = formData.duration
        if (d.string)
        {
            try
            {
                d.seconds = Duration.parse(d.string).toSeconds()
            }
            catch (err: any)
            {
                unwrap(ui.notifications).error(`Could not parse duration: ${err.message}`)
                throw err
            }
        }
        else
        {
            d.seconds = null
        }
        delete d.string

        return super._updateObject(event, formData)
    }
}

namespace Asd
{
    export type Data = ActiveEffectConfig.Data & {
        data: {
            duration: {
                string?: string
            }
        }
    }
}

function hasDurationExpired(
    d: Pick<ActiveEffect['data']['duration'], 'startTime' | 'seconds'>,
    f?: { initiative?: number })
{
    if (d.startTime && d.seconds)
    {
        const endTime = d.startTime + d.seconds

        if (game.time.worldTime > endTime)
            return true
        if (game.time.worldTime < endTime)
            return false

        const a = f?.initiative ?? Number.POSITIVE_INFINITY
        const b = getWorldInitiative() ?? Number.POSITIVE_INFINITY
        return b <= a
    }

    return false
}

const PARENT_DATA = Symbol()

declare module '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
{
    interface DocumentModificationOptions
    {
        embedded?: object
        [PARENT_DATA]?: DeepPartial<TokenData>
    }
}

export class Flop extends TokenDocument
{
    override async _preUpdate(
        data: DeepPartial<TokenData>,
        options: DocumentModificationOptions,
        user: User)
    {
        options[PARENT_DATA] = data
        await super._preUpdate(data, options, user)
        delete options[PARENT_DATA]
    }
}

function getWorldInitiative(): number | undefined
{
    if (!game.combat)
        return undefined

    if (game.combat.round == 0)
        return undefined

    return game.combat.combatant.initiative ?? undefined
}

export class StatusEffect extends ActiveEffect
{
    /** TODO */
    get expired(): boolean
    {
        return !!this.getFlag('wor', 'expired')
    }

    /** TODO */
    setExpired(value: boolean): MaybePromise
    {
        if (this.expired != value)
            return this.setFlag('wor', 'expired', value)
    }

    override get isTemporary(): boolean
    {
        return true
    }

    override async _preCreate(data: ActiveEffectDataConstructorData, options: DocumentModificationOptions, user: User): Promise<void>
    {
        await super._preCreate(data, options, user)

        const value = getWorldInitiative()
        if (value !== undefined)
        {
            this.data.update({
                flags: { wor: { initiative: value } }
            })
        }
    }

    override _preUpdate(changed: DeepPartial<ActiveEffectData>, options: DocumentModificationOptions): any
    {
        const setDuration = !!changed.duration || getProperty(changed, 'flags.wor.initiative') !== undefined
        let setExpired = getProperty(changed, 'flags.wor.expired') !== undefined

        if (options[PARENT_DATA])
        {
            changed = options[PARENT_DATA]!.actorData!.effects!.find(e => e._id! == changed._id!) as any
        }

        if (setDuration)
        {
            const expired = hasDurationExpired(
                { ...this.data.duration, ...changed.duration },
                { ...this.data.flags.wor, ...changed.flags?.wor },
            )
            setProperty(changed, 'flags.wor.expired', expired)
            setExpired = true
        }

        if (setExpired)
            changed.disabled = getProperty(changed, 'flags.wor.expired')
    }

    /** A string representing how much time is left on this effect or when it expires. */
    get remaining(): string
    {
        const { startTime, seconds } = this.data.duration

        if (startTime && seconds)
        {
            const remaining = startTime + seconds - game.time.worldTime
            if (remaining > 0)
                return Duration.fromSeconds(remaining).toString()
            if (remaining < 0)
                return 'expired'

            const current = getWorldInitiative() ?? Number.POSITIVE_INFINITY
            const expires = this.getFlag('wor', 'initiative') ?? Number.POSITIVE_INFINITY
            if (current <= expires)
                return 'expired'
            else
                return `on initiative ${expires}`
        }

        return 'unknown'
    }
}

function delay(ms: number): Promise<void>
{
    return new Promise(res => setTimeout(res, ms))
}

export namespace StatusEffect.Scheduler
{
    const updateLock = new Semaphore()

    export function init()
    {
        if (unwrap(game.user).isGM)
        {
            Hooks.on('updateWorldTime', onWorldTimeUpdated)
            Hooks.on('updateCombat', onCombatUpdated)
        }
    }

    async function onCombatUpdated()
    {
        const worldTime = game.time.worldTime
        const worldInitiative = getWorldInitiative()

        await delay(100)
        if (worldTime != game.time.worldTime || worldInitiative != getWorldInitiative())
            return

        await updateLock.wait()
        try
        {
            if (worldTime != game.time.worldTime || worldInitiative != getWorldInitiative())
                return

            await checkAll()
        }
        finally
        {
            updateLock.release()
        }
    }

    async function onWorldTimeUpdated(worldTime: number)
    {
        await updateLock.wait()
        try
        {
            if (worldTime != game.time.worldTime)
                return

            await checkAll()
        }
        finally
        {
            updateLock.release()
        }
    }

    async function checkAll()
    {
        time('StatusEffect.Scheduler.checkAll', async () =>
        {
            for (const actor of unwrap(game.actors))
                await checkActor(actor)

            for (const scene of unwrap(game.scenes))
                for (const token of scene.tokens)
                    if (!token.data.actorLink && token.actor)
                        await checkActor(token.actor)
        })
    }

    async function checkActor(actor: Actor)
    {
        for (const effect of actor.effects)
        {
            const expired = hasDurationExpired(effect.data.duration, effect.data.flags?.wor)
            await effect.setExpired(expired)
        }
    }
}

export namespace StatusEffect.Notifier
{
    export function init()
    {
        Hooks.on('updateActiveEffect', onEffectUpdated)
        Hooks.on('deleteActiveEffect', onEffectDeleted)
    }

    async function onEffectUpdated(effect: StatusEffect, change: DeepPartial<ActiveEffectData>, _: unknown, userId: string)
    {
        if (userId != game.userId)
            return

        const expired = getProperty(change, 'flags.wor.expired')
        if (expired === undefined)
            return

        if (expired)
        {
            expect(effect.parent)

            const data: ChatMessageDataConstructorData = {
                speaker: { actor: effect.parent.id },
                content: `${effect.data.label} has expired.`,
                flags: { wor: { associatedEffectId: unwrap(effect.id) } },
            }

            const player = getOwner(effect.parent)
            if (!player)
                data.whisper = [game.userId]
            else
                data.user = player.id

            await ChatMessage.create(data)
        }
        else
        {
            await deleteAssociatedMessages(unwrap(effect.id))
        }
    }

    function onEffectDeleted(effect: StatusEffect, _: unknown, userId: string)
    {
        if (userId != game.userId)
            return

        return deleteAssociatedMessages(unwrap(effect.id))
    }

    async function deleteAssociatedMessages(effectId: string)
    {
        const messageIds = unwrap(game.messages)
            .filter(m => m.getFlag('wor', 'associatedEffectId') == effectId)
            .map(m => m.id)

        await ChatMessage.deleteDocuments(messageIds)
    }
}
