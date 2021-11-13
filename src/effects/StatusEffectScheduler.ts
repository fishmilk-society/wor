import { unreachable, unwrap } from '../helpers/assertions'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
import StatusEffect, { UnknownExpiry } from './StatusEffect'
import Moment from '../helpers/Moment'

/**
 * A service which watches for any changes that might cause a status effect to
 * expire or un-expire.
 */
namespace StatusEffectScheduler
{
    /** Make ‘onMomentChanged’ synchronized. */
    const lock = new Semaphore()

    /** Initializes the service. */
    export function init()
    {
        Hooks.on('updateActiveEffect', onEffectUpdated)

        if (unwrap(game.user).isGM)
            Hooks.on('momentChanged', onMomentChanged)
    }

    async function onEffectUpdated(effect: StatusEffect, change: object, _: unknown, userId: string)
    {
        // Only run for the editor:
        if (userId !== game.userId)
            return

        // Check if this update is relevant:
        const expiryChanged = hasProperty(change, 'duration') || hasProperty(change, 'flags.wor.initiative')
        if (!expiryChanged)
            return

        const update = getUpdate(effect, Moment.now)
        if (update)
            await effect.update(update)
    }

    async function onMomentChanged(now: Moment)
    {
        const batch = Array<Promise<unknown>>()

        await lock.wait()
        try
        {
            // If time passed while we were waiting for the lock, then this
            // call is now obsolete:
            if (!now.equals(Moment.now))
                return

            // Check every effect in the game:
            await time('StatusEffect.Scheduler.onMomentChanged', async () =>
            {
                // Check unique actors:
                for (const actor of unwrap(game.actors))
                    checkActor(actor, now, batch)

                // Check instance actors:
                for (const scene of unwrap(game.scenes))
                    for (const token of scene.tokens)
                        if (!token.data.actorLink && token.actor)
                            checkActor(token.actor, now, batch)

                await Promise.all(batch)
            })
        }
        finally
        {
            lock.release()
        }
    }

    /**
     * Checks all the effects on an actor. If any have expired (or un-expired),
     * this method will update them accordingly.
     * @param actor The actor to check.
     * @param now The cached value for {@link Moment.now}.
     * @param batch A container for storing any asynchronous updates that need to be made.
     */
    function checkActor(actor: Actor, now: Moment, batch: Array<Promise<unknown>>): void
    {
        /** Used to update all of this actor’s effects at once. */
        const updates = Array<any>()

        for (const effect of actor.effects)
        {
            const update = getUpdate(effect, now)
            if (update)
                updates.push(update)
        }

        if (updates.length)
            batch.push(actor.updateEmbeddedDocuments('ActiveEffect', updates))
    }

    /**
     * If this effect needs to be expired (or un-expired), this method will
     * return the update object.
     */
    function getUpdate(effect: StatusEffect, now: Moment): object | undefined
    {
        const oldValue = effect.data.flags.wor?.expired
        const newValue = shouldBeExpired(effect, now)
        if (oldValue === newValue)
            return

        return {
            _id: effect.id,
            'flags.wor.expired': newValue,
            'disabled': newValue
        }
    }

    /**
     * Determines whether an effect should be expired by now.
     */
    function shouldBeExpired(effect: StatusEffect, now: Moment): boolean
    {
        const expiry = effect.expiry
        if (expiry instanceof Moment)
            return expiry.compareTo(now) <= 0
        if (expiry === UnknownExpiry)
            return false
        unreachable(expiry)
    }
}

export default StatusEffectScheduler
