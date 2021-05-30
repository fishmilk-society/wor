import Duration from "../helpers/duration"
import MODULE from "../helpers/module-name"

namespace Expiry
{
    const FLAG = 'expiryMessageId'

    export async function triggerFor(effect: ActiveEffect): Promise<void>
    {
        const newMessage = await ChatMessage.create({
            speaker: { actor: effect.parent._id },
            content: `${effect.data.label} has expired.`
        })
        await effect.setFlag(MODULE, FLAG, newMessage!._id)
    }

    export async function undoFor(effect: ActiveEffect): Promise<void>
    {
        const id = effect.getFlag(MODULE, FLAG)
        if (typeof id == 'string')
            await ChatMessage.delete(id)
        await effect.unsetFlag(MODULE, FLAG)
    }

    export function hasTriggeredFor(effect: ActiveEffect): boolean
    {
        return !!effect.getFlag(MODULE, FLAG)
    }

    export async function cleanupFor(deletedEffectData: ActiveEffectData): Promise<void>
    {
        const id = getProperty(deletedEffectData, `flags.${MODULE}.${FLAG}`)
        if (typeof id == 'string')
            await ChatMessage.delete(id)
    }
}

namespace ExpiryHooks
{
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

    function checkForExpiry(effect: ActiveEffect)
    {
        const actual = Expiry.hasTriggeredFor(effect)
        const expected = shouldHaveExpired(effect)
        if (actual != expected)
        {
            if (expected)
                Expiry.triggerFor(effect)
            else
                Expiry.undoFor(effect)
        }
    }

    Hooks.on('updateWorldTime', function()
    {
        if (!game.user!.isGM)
            return

        game.actors!.forEach(actor =>
        {
            actor.effects.forEach(checkForExpiry)
        })
    })

    Hooks.on<Hooks.PreCreateEmbeddedEntity<ActiveEffectData>>('preCreateActiveEffect', function(_, data)
    {
        data.duration ??= {}
        data.duration.startTime = game.time.worldTime
        return true
    })

    Hooks.on<Hooks.UpdateEmbeddedEntity<Entity, Actor>>('updateActiveEffect', function(parent, data, _, __, userId: any)
    {
        if (userId != game.userId)
            return

        const effect = parent.effects.get(data._id)
        if (!effect)
            throw 'Could not find updated effect'

        window.setTimeout(function()
        {
            checkForExpiry(effect)
        })

        return true
    })

    Hooks.on<Hooks.DeleteEmbeddedEntity<ActiveEffectData>>('deleteActiveEffect', function(_, data, __, userId: any)
    {
        if (userId != game.userId)
            return

        Expiry.cleanupFor(data)
    })
}

export class Effect extends ActiveEffect
{
    get isTemporary(): boolean
    {
        if (Expiry.hasTriggeredFor(this))
            return false
        return super.isTemporary
    }

    apply(actor: Actor, change: ActiveEffectChange)
    {
        if (Expiry.hasTriggeredFor(this))
            return
        super.apply(actor, change)
    }

    get remaining(): string
    {
        const { startTime, seconds } = this.data.duration
        if (startTime && seconds)
        {
            const remaining = startTime + seconds - game.time.worldTime
            if (remaining < 0)
                return 'expired'
            else if (remaining == 0)
                return 'this round'
            else
                return Duration.fromSeconds(remaining).toString()
        }
        return 'unknown'
    }
}

Hooks.on('init', function()
{
    CONFIG.ActiveEffect.entityClass = Effect
})
