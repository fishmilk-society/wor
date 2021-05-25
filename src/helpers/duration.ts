const units: Record<string, number> = (function()
{
    const second = 1
    const round = 6 * second
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    return { day, hour, minute, round, second }
})()

export default class Duration
{
    private constructor(private readonly seconds: number)
    {
    }

    public static fromSeconds(seconds: number): Duration
    {
        if (!Number.isSafeInteger(seconds))
        {
            throw new TypeError('Expected argument ‘seconds’ to be an integer.')
        }
        if (seconds <= 0)
        {
            throw new RangeError('Expected argument ‘seconds’ to be a non-negative number.')
        }
        return new Duration(seconds)
    }

    public toSeconds(): number
    {
        return this.seconds
    }

    public toStringLossy(): string
    {
        for (const term of format(this.seconds, 'lossy'))
        {
            return term
        }

        return /* unreachable */ null!
    }

    public toStringExact(): string
    {
        const terms = Array.from(format(this.seconds, 'exact'))

        if (terms.length >= 3)
        {
            terms[terms.length - 1] = 'and ' + terms[terms.length - 1]
            return terms.join(', ')
        }
        else
        {
            return terms.join(' and ')
        }
    }
}

function* format(seconds: number, mode: 'exact' | 'lossy'): Iterable<string>
{
    for (const name in units)
    {
        const size = units[name]
        if (seconds >= size)
        {
            const q = Math.floor(seconds / size)
            yield `${q} ${name}${q >= 2 ? 's' : ''}`
            seconds -= size * q
        }
    }
}
