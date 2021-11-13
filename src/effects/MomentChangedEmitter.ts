import { delay } from '../helpers/delay'
import Moment from '../helpers/Moment'

declare global
{
    namespace Hooks
    {
        export interface StaticCallbacks
        {
            momentChanged(now: Moment): void
        }
    }
}

/**
 * This service triggers a hook whenever the value of {@link Moment.now} is
 * changed. The event is debounced by 100ms.
 */
namespace MomentChangedEmitter
{
    let last: Moment

    /** Initialize the service. */
    export function init()
    {
        last = Moment.now

        // Watch the initiative tracker:
        Hooks.on('updateCombat', checkForChange)

        // Watch the clock:
        Hooks.on('updateWorldTime', checkForChange)
    }

    async function checkForChange()
    {
        const now = Moment.now

        // If nothing substantial has changed, just exit:
        if (last.equals(now))
            return

        // Debounce:
        await delay(100)
        if (!now.equals(Moment.now))
            return

        Hooks.callAll('momentChanged', now)
        last = now
    }
}

export default MomentChangedEmitter
