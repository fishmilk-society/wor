import Duration from "../helpers/duration"
import MODULE from "../helpers/module"

namespace ExpiryNotification
{
    const FLAG = 'expiryNotification'

    export async function triggerFor(effect: ActiveEffect): Promise<void>
    {
        const newMessage = await ChatMessage.create({
            speaker: { actor: effect.parent._id },
            content: `${effect.data.label} has expired.`
        })

        effect.setFlag(MODULE, FLAG, newMessage!._id)
    }

    export async function deleteFor(effect: ActiveEffect): Promise<void>
    {
        const id = effect.getFlag(MODULE, FLAG)

        if (typeof id == 'string')
            ChatMessage.delete(id)

        await effect.unsetFlag(MODULE, FLAG)
    }

    export function hasTriggeredFor(effect: ActiveEffect): boolean
    {
        return !!effect.getFlag(MODULE, FLAG)
    }
}

export class Effect extends ActiveEffect
{
    async checkForExpiry()
    {
        const shouldBe = this.shouldBeExpired
        if (this.expired != shouldBe)
        {
            if (shouldBe)
            {
                ExpiryNotification.triggerFor(this)
            }
            else
            {
                ExpiryNotification.deleteFor(this)
            }
        }
    }

    get expired(): boolean
    {
        return ExpiryNotification.hasTriggeredFor(this)
    }

    get shouldBeExpired(): boolean
    {
        let d = this.data.duration

        if (d.startTime && d.seconds)
        {
            const remaining = d.startTime + d.seconds - game.time.worldTime

            if (remaining < 0)
                return true
        }

        return false
    }

    get isTemporary(): boolean
    {
        return super.isTemporary && !this.expired
    }

    apply(actor: Actor, change: ActiveEffectChange)
    {
        if (this.expired)
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

Hooks.on('updateWorldTime', function(worldTime, dt)
{
    game.actors!.forEach(actor =>
    {
        actor.effects.forEach(effectObj =>
        {
            const effect = effectObj as Effect
            effect.checkForExpiry()
        })
    })
})
