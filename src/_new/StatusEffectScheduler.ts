import { unwrap } from '../helpers/assertions'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
import { StatusEffect } from './StatusEffect'
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

        // Do the thing:
        await effect.refreshIsExpired()
    }

    /** Make ‘onMomentChanged’ synchronized. */
    const lock = new Semaphore()

    /** Called whenever the clock or initiative tracker changes. */
    async function onMomentChanged(now: Instant)
    {
        await lock.wait()
        try
        {
            // If the time changed while waiting for the lock, then this call is now obsolete:
            if (!now.equals(Instant.now))
                return

            // Check every effect in the game:
            await time('StatusEffect.Scheduler.onMomentChanged', async () =>
            {
                await checkUniqueActors()
                await checkInstanceActors()
            })
        }
        finally
        {
            lock.release()
        }

        async function checkUniqueActors()
        {
            for (const actor of unwrap(game.actors))
                await checkActor(actor)
        }

        async function checkInstanceActors()
        {
            for (const scene of unwrap(game.scenes))
                for (const token of scene.tokens)
                    if (!token.data.actorLink && token.actor)
                        await checkActor(token.actor)
        }

        async function checkActor(actor: Actor)
        {
            for (const effect of actor.effects)
                await effect.refreshIsExpired(now)
        }
    }
}
