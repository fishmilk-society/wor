import { unwrap } from '../helpers/assertions'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
import { getWorldInitiative, StatusEffect } from './StatusEffect'
import { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'

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

    async function onEffectUpdated(effect: StatusEffect, change: DeepPartial<ActiveEffectData>, _: unknown, userId: string)
    {
        // Only run for the entity’s editor:
        if (userId != game.userId)
            return

        // Only run if the expiry time will have changed:
        const expiryChanged = hasProperty(change, 'duration') || hasProperty(change, 'flags.wor.initiative')
        if (!expiryChanged)
            return

        await effect.refreshIsExpired()
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
            await effect.refreshIsExpired()
    }
}
