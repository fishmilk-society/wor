const units: Record<string, number> = (function()
{
    const second = 1
    const round = 6 * second
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    return { day, hour, minute, round, second }
})()

function impl(seconds: number): string
{
    if (!Number.isSafeInteger(seconds))
    {
        throw new TypeError('Expected argument ‘seconds’ to be an integer.')
    }
    if (arguments.length > 1)
    {
        throw new SyntaxError('Too many arguments')
    }

    if (seconds <= 0)
    {
        return seconds == 0 ? 'this round' : 'expired'
    }

    for (const name in units)
    {
        let k = units[name]
        if (seconds >= k)
        {
            let q = Math.floor(seconds / k)
            return `${q} ${name}${q >= 2 ? 's' : ''}`
        }
    }

    return /* unreachable */ null!
}

export { impl as default }
