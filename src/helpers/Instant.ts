import Duration from './duration'

export default class Instant
{
    readonly #clock: number
    readonly #initiative: number

    constructor(clock: number, initiative?: number)
    {
        if (!Number.isSafeInteger(clock))
            throw new TypeError('Expected argument ‘clock’ to be an integer.')

        this.#clock = clock
        this.#initiative = initiative ?? Number.POSITIVE_INFINITY
    }

    get clock(): number
    {
        return this.#clock
    }

    get initiative(): number | undefined
    {
        if (Number.isFinite(this.#initiative))
            return this.#initiative
        else
            return undefined
    }

    addSeconds(seconds: number): Instant
    {
        if (!Number.isSafeInteger(seconds))
            throw new TypeError('Expected argument ‘seconds’ to be an integer.')

        return new Instant(this.#clock + seconds, this.#initiative)
    }

    plus(duration: Duration): Instant
    {
        return this.addSeconds(duration.toSeconds())
    }

    minus(duration: Duration)
    {
        return this.addSeconds(-duration.toSeconds())
    }

    compareTo(other: Instant): -1 | 0 | 1
    {
        if (this.#clock > other.#clock)
            return +1
        if (this.#clock < other.#clock)
            return -1
        if (this.#initiative < other.#initiative)
            return +1
        if (this.#initiative > other.#initiative)
            return -1
        return 0
    }

    relative(now = Instant.now): string
    {
        if (this.compareTo(now) <= 0)
            return 'past'

        let remaining = this.#clock - now.#clock

        if (this.#initiative > now.#initiative)
            remaining -= 6

        if (remaining >= 6)
            return Duration.fromSeconds(remaining).toString()
        else if (Number.isFinite(this.#initiative))
            return `on initiative ${this.#initiative}`
        else
            return 'end of this round'
    }

    static get now(): Instant
    {
        const clock = game.time.worldTime

        const initiative = (function(): number | undefined
        {
            const combat = game.combat
            if (combat && combat.round > 0)
                return combat.combatant.initiative ?? undefined
            else
                return undefined
        })()

        return new Instant(clock, initiative)
    }
}
