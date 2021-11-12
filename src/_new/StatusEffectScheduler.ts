import { unreachable, unwrap } from '../helpers/assertions'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
import { StatusEffect, UnknownExpiry } from './StatusEffect'
import Instant from '../helpers/Instant'

/**
 * A service which watches for any changes that might cause a status effect to
 * expire or un-expire.
 */
export namespace StatusEffectScheduler
{
    /** Initializes {@link StatusEffectScheduler}. */
    export function init()
    {
        Hooks.on('updateActiveEffect', onEffectUpdated)

        if (unwrap(game.user).isGM)
            Hooks.on('momentChanged', onMomentChanged)
    }

    /** Called whenever a status effect is modified. */
    async function onEffectUpdated(effect: StatusEffect, change: object, _: unknown, userId: string)
    {
        // Only run for the editor:
        if (userId !== game.userId)
            return

        // Check if this update is relevant:
        const expiryChanged = hasProperty(change, 'duration') || hasProperty(change, 'flags.wor.initiative')
        if (!expiryChanged)
            return

        // Check if the effect needs expiring:
        const update = getUpdate(effect, Instant.now)
        if (update)
            await effect.update(update)
    }

    /** Make ‘onMomentChanged’ synchronized. */
    const lock = new Semaphore()

    /** Called whenever the clock or initiative tracker changes. */
    async function onMomentChanged(now: Instant)
    {
        const batch = Array<Promise<unknown>>()

        await lock.wait()
        try
        {
            // If the time changed while waiting for the lock, then this call is now obsolete:
            if (!now.equals(Instant.now))
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

                // Wait for all the things:
                await Promise.all(batch)
            })
        }
        finally
        {
            lock.release()
        }
    }

    function checkActor(actor: Actor, now: Instant, batch: Array<Promise<unknown>>): void
    {
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

    function getUpdate(effect: StatusEffect, now: Instant): object | undefined
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

    function shouldBeExpired(effect: StatusEffect, now: Instant): boolean
    {
        const expiry = effect.expiry
        if (expiry instanceof Instant)
            return expiry.compareTo(now) <= 0
        if (expiry === UnknownExpiry)
            return false
        unreachable(expiry)
    }
}
