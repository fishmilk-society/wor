import Duration from './duration'

export default class Moment
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

    addSeconds(seconds: number): Moment
    {
        if (!Number.isSafeInteger(seconds))
            throw new TypeError('Expected argument ‘seconds’ to be an integer.')

        return new Moment(this.#clock + seconds, this.#initiative)
    }

    plus(duration: Duration): Moment
    {
        return this.addSeconds(duration.toSeconds())
    }

    minus(duration: Duration)
    {
        return this.addSeconds(-duration.toSeconds())
    }

    compareTo(other: Moment): -1 | 0 | 1
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

    equals(other: Moment): boolean
    {
        return this.compareTo(other) == 0
    }

    toRelativeString(options?: RelativeStringOptions): string
    {
        const now = options?.now ?? Moment.now

        const formats = { ...DEFAULT_FORMATS, ...options?.formats }

        if (this.compareTo(now) <= 0)
            return formats.inThePast

        let remaining = this.#clock - now.#clock

        if (this.#initiative > now.#initiative)
            remaining -= 6

        if (remaining >= 6)
            return formats.inSeconds(remaining)
        else if (Number.isFinite(this.#initiative))
            return formats.onInitiative(this.#initiative)
        else
            return formats.atEndOfRound
    }

    static get now(): Moment
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

        return new Moment(clock, initiative)
    }
}

export type RelativeStringOptions = {
    now?: Moment
    formats?: Partial<RelativeStringFormats>
}

export type RelativeStringFormats = {
    inSeconds: (seconds: number) => string
    onInitiative: (initiative: number) => string
    atEndOfRound: string
    inThePast: string
}

export const DEFAULT_FORMATS: RelativeStringFormats = {
    inSeconds: s => Duration.fromSeconds(s).toString(),
    onInitiative: i => `on initiative ${i}`,
    atEndOfRound: 'at end of round',
    inThePast: 'in the past'
}
