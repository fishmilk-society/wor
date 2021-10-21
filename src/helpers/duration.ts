const units: Record<string, number> = (function()
{
    const second = 1
    const round = 6 * second
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    return { day, hour, minute, round, second }
})()

namespace Parsing
{
    function parseUnit(unitName: string): number
    {
        // De-pluralize and de-periodize:
        unitName = unitName.replace(/s?\.?$/, '')

        // De-abbreviate:
        if (unitName == 'min')
            unitName = 'minute'

        // Try getting the unit:
        const unit = units[unitName]
        if (!unit)
            throw new Error(`Unrecognized unit ${unitName}`)

        return unit
    }

    function parseSingleTerm(term: string): number
    {
        // Remove whitespace:
        term = term.trim()

        // If this term is empty, ignore it:
        if (term == '')
            return 0

        // Split the expression into `${q} ${unit}`
        const match = term.match(/^(\d+)\s+([A-Za-z\.]+)$/)
        if (!match)
            throw new Error(`Unparseable expression ‘${term}’`)

        // Parse it all:
        const quantity = parseInt(match[1])
        const unit = parseUnit(match[2])
        return quantity * unit
    }

    export function parse(str: string): number
    {
        const terms = str.split(/(?:,|\band\b|\bplus\b)/)

        let totalSeconds = 0
        for (const term of terms)
            totalSeconds += parseSingleTerm(term)

        return totalSeconds
    }
}

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

    public static parse(str: string): Duration
    {
        const seconds = Parsing.parse(str)
        return Duration.fromSeconds(seconds)
    }

    public toSeconds(): number
    {
        return this.seconds
    }

    public toString(): string
    {
        const terms = []

        // Build up the list of terms:
        let seconds = this.seconds
        for (const name in units)
        {
            const size = units[name]
            if (seconds >= size)
            {
                const q = Math.floor(seconds / size)
                terms.push(`${q} ${name}${q >= 2 ? 's' : ''}`)
                seconds -= size * q
            }
        }

        // Concatenate the list of terms:
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
