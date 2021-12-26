import { unwrap } from '../helpers/assertions'
import { delay } from '../helpers/delay'
import Moment from '../helpers/Moment'

declare global
{
    namespace Hooks
    {
        export interface StaticCallbacks
        {
            momentChanged(now: Moment, byMe: boolean): void
        }
    }
}

/**
 * This service triggers a hook whenever the value of {@link Moment.now} is
 * changed. The event is debounced by 100ms.
 */
namespace MomentChangedEmitter
{
    let byMe = false
    let lastDebounce = 0
    let lastMoment: Moment

    /** Initialize the service. */
    export function init()
    {
        lastMoment = Moment.now

        // Watch the initiative tracker:
        Hooks.on('updateCombat', function()
        {
            byMe = detectWhetherByMe()
            checkForChange()
        })

        // Watch the clock:
        Hooks.on('updateSetting', function(setting, _, __, userId)
        {
            if (setting.key != 'core.time')
                return

            if (userId != undefined)
                byMe = detectWhetherByMe()

            checkForChange()
        })
    }

    async function checkForChange()
    {
        const now = Moment.now

        // Debounce:
        const debounce = ++lastDebounce
        await delay(100)
        if (debounce != lastDebounce)
            return

        // Check that this update is still relevant:
        if (lastMoment.equals(now))
            return

        Hooks.callAll('momentChanged', now, byMe)
        lastMoment = now
    }

    function detectWhetherByMe(): boolean
    {
        const stackTrace = unwrap(new Error().stack)
        return stackTrace.includes('_updateDocuments')
    }
}

export default MomentChangedEmitter
