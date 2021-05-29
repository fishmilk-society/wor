import Duration from "../helpers/duration"

export class Effect extends ActiveEffect
{
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
