import Duration from "../helpers/duration"

export class Effect extends ActiveEffect
{
    get expired(): boolean
    {
        return !!this.getFlag('wor', 'expired')
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

Hooks.on('updateWorldTime', (worldTime, dt) =>
{
    game.actors?.forEach(actor =>
    {
        let updates

        actor.effects.forEach(effectObj =>
        {
            const effect = effectObj as Effect
            const shouldBe = effect.shouldBeExpired
            if (effect.expired != shouldBe)
            {
                updates ??= []
                updates.push({ _id: effect.id, 'flags.wor.expired': shouldBe })
            }
        })

        if (updates)
            actor.updateEmbeddedEntity('ActiveEffect', updates)
    })
})
