export default class Effect extends ActiveEffect
{
    get expired(): boolean
    {
        const d = this.data.duration
        if (d.startTime && d.seconds)
        {
            const remaining = d.startTime + d.seconds - game.time.worldTime
            return remaining < 0
        }
        return false
    }

    get isTemporary(): boolean
    {
        return super.isTemporary && !this.expired
    }

    apply(actor: Actor, change: ActiveEffect.Change)
    {
        if (this.expired)
            return

        return super.apply(actor, change)
    }
}
