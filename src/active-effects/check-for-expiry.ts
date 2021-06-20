/**
 * @file
 * This module ensures that effects expire when they should. It watches for modifications to
 * effects as well as changes in time.
 */

import Semaphore from '../helpers/semaphor'
import { revertExpiryFor, triggerExpiryFor, wasExpiryTriggeredFor } from './expiry-messages'

/**
 * Only run ‘update’ loop can run at once, otherwise there will be race conditions.
 */
const updateLock = new Semaphore()

/**
 * If time was advanced, some effects may have expired.
 */
Hooks.on('updateWorldTime', async function()
{
    // Only run this hook for the GM:
    if (!game.user!.isGM)
        return

    // Make this is the only update loop being run:
    await updateLock.wait()

    // Keep track of every promise we start during this loop:
    const promises = Array<Promise<void>>()

    // For every effect on every actor, check if the effect has expired (or unexpired):
    game.actors!.forEach(actor =>
    {
        actor.effects.forEach(effect =>
        {
            const promise = checkForExpiry(effect)
            if (promise)
                promises.push(promise)
        })
    })

    // Ensure that any future update loops run after this one is fully committed:
    await Promise.all(promises)
    updateLock.release()
})

/**
 * If an effect is updated, its duration may have changed.
 */
Hooks.on<Hooks.UpdateEmbeddedEntity<Entity, Actor>>('updateActiveEffect', function(parent, data, _, __, userId: any)
{
    // Only run this hook for the user that made the change:
    if (userId != game.userId)
        return

    // Get the effect that’s being updated:
    const effect = parent.effects.get(data._id)
    if (!effect)
        throw 'Could not find updated effect'

    // The effect won’t have actually updated yet, so wait until the next cycle:
    window.setTimeout(function()
    {
        // Check if the effect has expired (or unexpired):
        checkForExpiry(effect)
    })
})

/**
 * Expires effects whose duration has been exceeded. This method can also unexpire effects (e.g.
 * if their duration was increased or if time was rewinded).
 */
function checkForExpiry(effect: ActiveEffect): Promise<void> | void
{
    const actual = wasExpiryTriggeredFor(effect)
    const expected = shouldHaveExpired(effect)
    if (actual != expected)
    {
        if (expected)
            return triggerExpiryFor(effect)
        else
            return revertExpiryFor(effect)
    }
}

/**
 * Checks whether an effect has exceeded its duration.
 */
function shouldHaveExpired(effect: ActiveEffect): boolean
{
    const { startTime, seconds } = effect.data.duration
    if (startTime && seconds)
    {
        const remainingSeconds = startTime + seconds - game.time.worldTime
        return remainingSeconds < 0
    }
    return false
}
