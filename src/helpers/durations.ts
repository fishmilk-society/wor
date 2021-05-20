// export function getRemaining(duration: ActiveEffectDuration): string
// {
//     if (duration.startTime !== undefined && duration.seconds !== undefined)
//     {
//         const remaining = duration.startTime + duration.seconds - game.time.worldTime
//         return `${remaining} seconds`
//     }

//     return `unknown`
// }

const UNITS: Record<string, number> = (function()
{
    const second = 1
    const round = 6 * second
    const minute = 60 * second
    const hour = 60 * minute
    const day = 24 * hour
    return { day, hour, minute, round, second }
})()

export function durationStringFromSeconds(seconds: number): string
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

    for (const name in UNITS)
    {
        let k = UNITS[name]
        if (seconds >= k)
        {
            let q = Math.floor(seconds / k)
            return `${q} ${name}${q >= 2 ? 's' : ''}`
        }
    }

    return /* unreachable */ null!
}

export function durationStringFromObject(duration: ActiveEffectDuration): string
{
    if (duration.startTime !== undefined && duration.seconds !== undefined)
    {
        const remaining = duration.startTime + duration.seconds - game.time.worldTime
        return durationStringFromSeconds(remaining)
    }

    throw 'not implemented'
}
