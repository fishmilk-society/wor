/**
 * @file
 * This module improves the readability of ‘remaining duration’ strings.
 */

import Duration from '../helpers/duration'

/**
 * Mix functionality into the @see ActiveEffect class.
 */
Hooks.on('init', function()
{
    CONFIG.ActiveEffect.entityClass = class extends CONFIG.ActiveEffect.entityClass
    {
        get duration(): ActiveEffect.ReturnedDuration
        {
            // The fallback label:
            let label = 'unknown'

            // For fixed-time durations, render the remaining time:
            const { startTime, seconds } = this.data.duration
            if (startTime && seconds)
            {
                const remaining = startTime + seconds - game.time.worldTime
                if (remaining < 0)
                    label = 'expired'
                else if (remaining == 0)
                    label = 'this round'
                else
                    label = Duration.fromSeconds(remaining).toString()
            }

            // Foundry doesn’t use any of the properties returned from this method, and _we_ only
            // need the human-readable part:
            return {
                label: label,
            } as ActiveEffect.ReturnedDuration
        }
    }
})
