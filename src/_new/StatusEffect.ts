import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData'
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData'
import { ActiveEffectData, ChatMessageData, TokenData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { expect, unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'
import { getOwner } from '../helpers/get-owner'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
import Instant from '../helpers/Instant'

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
    }
}

export function getWorldInitiative(): number | undefined
{
    if (!game.combat)
        return undefined

    if (game.combat.round == 0)
        return undefined

    return game.combat.combatant.initiative ?? undefined
}

export function hasDurationExpired(
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

        const init = Instant.now().init

        this.data.update({
            flags: { wor: { initiative: init } }
        })
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
