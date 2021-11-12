import Duration from './duration'

export default class Instant
{
    readonly #clock: number
    readonly #init: number

    constructor(clock: number, init?: number)
    {
        if (!Number.isSafeInteger(clock))
            throw new TypeError('Expected argument ‘clock’ to be an integer.')

        this.#clock = clock
        this.#init = init ?? Number.POSITIVE_INFINITY
    }

    get clock(): number
    {
        return this.#clock
    }

    get init(): number | undefined
    {
        if (Number.isFinite(this.#init))
            return this.#init
        else
            return undefined
    }

    addSeconds(seconds: number): Instant
    {
        if (!Number.isSafeInteger(seconds))
            throw new TypeError('Expected argument ‘seconds’ to be an integer.')

        return new Instant(this.#clock + seconds, this.#init)
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
        if (this.#init < other.#init)
            return +1
        if (this.#init > other.#init)
            return -1
        return 0
    }

    relative(): string
    {
        return this.relativeTo(Instant.now())
    }

    relativeTo(other: Instant): string
    {
        let remaining = this.#clock - other.#clock

        if (remaining < 0)
            return 'past'
        if (remaining == 0 && this.#init >= other.#init)
            return 'past'

        if (this.#init > other.#init)
            remaining -= 6

        if (remaining >= 6)
            return Duration.fromSeconds(remaining).toString()
        else if (Number.isFinite(this.#init))
            return `on initiative ${this.#init}`
        else
            return 'end of this round'
    }

    static now(): Instant
    {
        const clock = game.time.worldTime

        const init = (function(): number | undefined
        {
            const combat = game.combat
            if (combat && combat.round > 0)
                return combat.combatant.initiative ?? undefined
            else
                return undefined
        })()

        return new Instant(clock, init)
    }
}
