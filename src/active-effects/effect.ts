import Duration from "../helpers/duration"
import ExpiryMessage from "./expiry-message"
import './check-for-expiry'

export class spfActiveEffect extends ActiveEffect
{
    get isTemporary(): boolean
    {
        if (ExpiryMessage.hasTriggeredFor(this))
            return false
        return super.isTemporary
    }

    apply(actor: Actor, change: ActiveEffectChange)
    {
        if (ExpiryMessage.hasTriggeredFor(this))
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

Hooks.on<Hooks.PreCreateEmbeddedEntity<ActiveEffectData>>('preCreateActiveEffect', function(_, data)
{
    data.duration ??= {}
    data.duration.startTime = game.time.worldTime
    return true
})

Hooks.on('init', function()
{
    CONFIG.ActiveEffect.entityClass = spfActiveEffect
})
