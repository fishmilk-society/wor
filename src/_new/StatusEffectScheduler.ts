import { unwrap } from '../helpers/assertions'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
import { StatusEffect } from './StatusEffect'
import Instant from '../helpers/Instant'

export namespace StatusEffectScheduler
{
    const updateLock = new Semaphore()

    export function init()
    {
        Hooks.on('updateActiveEffect', onEffectUpdated)

        if (unwrap(game.user).isGM)
        {
            Hooks.on('updateWorldTime', onWorldTimeUpdated)
            Hooks.on('updateCombat', onCombatUpdated)
        }
    }

    async function onEffectUpdated(effect: StatusEffect, change: object, _: unknown, userId: string)
    {
        // Only run for the editor:
        if (userId !== game.userId)
            return

        const expiryChanged = hasProperty(change, 'duration') || hasProperty(change, 'flags.wor.initiative')
        if (!expiryChanged)
            return

        await effect.refreshIsExpired()
    }

    async function onCombatUpdated()
    {
        const originalTime = Instant.now

        await delay(100)
        if (!originalTime.equals(Instant.now))
            return

        await updateLock.wait()
        try
        {
            if (!originalTime.equals(Instant.now))
                return

            await checkAll()
        }
        finally
        {
            updateLock.release()
        }
    }

    async function onWorldTimeUpdated()
    {
        const originalTime = Instant.now

        await updateLock.wait()
        try
        {
            if (!originalTime.equals(Instant.now))
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
            await effect.refreshIsExpired()
    }
}
