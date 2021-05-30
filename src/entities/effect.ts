import Duration from "../helpers/duration"
import MODULE from "../helpers/module"

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
}

Hooks.on('updateWorldTime', function()
{
    if (!game.user!.isGM)
        return

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

    game.actors!.forEach(actor =>
    {
        actor.effects.forEach(checkForExpiry)
    })
})

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
        let d = this.data.duration

        if (d.startTime && d.seconds)
        {
            const remaining = d.startTime + d.seconds - game.time.worldTime

            if (remaining == 0)
                return 'this round'
            else if (remaining < 0)
                return 'expired'
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
