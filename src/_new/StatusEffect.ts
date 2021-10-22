import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectData, TokenData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { Uniquity } from '../helpers/uniquity'

function hasDurationExpired(d: Pick<ActiveEffect['data']['duration'], 'startTime' | 'seconds'>)
{
    if (d.startTime && d.seconds)
    {
        const endTime = d.startTime + d.seconds
        return game.time.worldTime > endTime
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

    override _preUpdate(changed: DeepPartial<ActiveEffectData>, options: DocumentModificationOptions): any
    {
        if (options[PARENT_DATA])
        {
            changed = options[PARENT_DATA]!.actorData!.effects!.find(e => e._id! == changed._id!) as any
        }

        if (changed.duration)
        {
            const expired = hasDurationExpired({ ...this.data.duration, ...changed.duration })
            setProperty(changed, 'flags.wor.expired', expired)
        }

        const expired = getProperty(changed, 'flags.wor.expired')
        if (expired !== undefined)
            changed.disabled = expired
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

            return 'this round'
        }

        return 'unknown'
    }
}

export namespace StatusEffect.Scheduler
{
    const updateLock = new Semaphore()

    export function init()
    {
        if (unwrap(game.user).isGM)
            Hooks.on('updateWorldTime', onTimeChanged)
    }

    async function onTimeChanged(worldTime: number)
    {
        time('StatusEffect.Scheduler.onTimeChanged', async () =>
        {
            await updateLock.wait()

            if (worldTime != game.time.worldTime)
                return

            for (const actor of unwrap(game.actors))
                await checkActor(actor)

            for (const scene of unwrap(game.scenes))
                for (const token of scene.tokens)
                    if (!token.data.actorLink && token.actor)
                        await checkActor(token.actor)

            updateLock.release()
        })
    }

    async function checkActor(actor: Actor)
    {
        for (const effect of actor.effects)
        {
            const expired = hasDurationExpired(effect.data.duration)
            await effect.setExpired(expired)
        }
    }
}
