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
        {
            Hooks.on('updateCombat', onCombatUpdated)
            Hooks.on('updateWorldTime', onWorldTimeUpdated)
        }
    }

    /** Used to prevent ‘checkEverything’ calls from overlapping */
    const updateLock = new Semaphore()

    /** Used to prevent superfluous calls to ‘checkEverything.’ */
    let lastUpdate: Instant | undefined

    /** Called whenever a status effect is modified. */
    async function onEffectUpdated(effect: StatusEffect, change: object, _: unknown, userId: string)
    {
        // Only run for the editor:
        if (userId !== game.userId)
            return

        // Check if either of these properties have changed:
        const expiryChanged = hasProperty(change, 'duration') || hasProperty(change, 'flags.wor.initiative')
        if (!expiryChanged)
            return

        // Check if this effect needs expiring:
        await effect.refreshIsExpired()
    }

    /** Called whenever the encounter is modified. */
    async function onCombatUpdated()
    {
        // We have to delay slightly, so that the clock has a chance to catch up. Without this, we
        // end up with weird issues when going between rounds.
        await delay(100)

        // Do the thing:
        await checkEverything()
    }

    /** Called whenever the clock changes. */
    async function onWorldTimeUpdated()
    {
        // Just do the thing:
        await checkEverything()
    }

    /** Check every effect in the game. */
    async function checkEverything()
    {
        // Avoid overlapping calls:
        await updateLock.wait()
        try
        {
            // Read this property immediately, because it might change while we’re in this call:
            const now = Instant.now

            // Avoid superfluous calls:
            if (lastUpdate && lastUpdate.equals(now))
                return
            lastUpdate = now

            // Perform the full update (and measure it):
            await time('StatusEffect.Scheduler.checkEverything', async () =>
            {
                await checkUniqueActors(now)
                await checkInstanceActors(now)
            })
        }
        finally
        {
            updateLock.release()
        }
    }

    /** Check all effects attached to unique actors. */
    async function checkUniqueActors(now: Instant)
    {
        for (const actor of unwrap(game.actors))
            await checkActor(actor, now)
    }

    /** Check all effects attached to instance actors. */
    async function checkInstanceActors(now: Instant)
    {
        for (const scene of unwrap(game.scenes))
            for (const token of scene.tokens)
                if (!token.data.actorLink && token.actor)
                    await checkActor(token.actor, now)
    }

    /** Check the effects attached to the specified actor. */
    async function checkActor(actor: Actor, now: Instant)
    {
        for (const effect of actor.effects)
            await effect.refreshIsExpired(now)
    }
}
