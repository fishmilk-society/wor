import { expect } from '../helpers/assertions'
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

namespace MomentChangedEmitter
{
    let last: Moment

    export function init()
    {
        last = Moment.now
        Hooks.on('updateCombat', checkForChange)
        Hooks.on('updateWorldTime', checkForChange)
        Hooks.on('momentChanged', n => console.log('momentChanged', n))
    }

    async function checkForChange()
    {
        // Sanity check:
        expect(last)

        // Retrieve the current moment:
        const now = Moment.now

        // If this was misfire, just exit:
        if (last.equals(now))
            return

        // Delay and debounce:
        await delay(100)
        if (!now.equals(Moment.now))
            return

        // Lastly, emit the event:
        Hooks.callAll('momentChanged', now)
        last = now
    }
}

export default MomentChangedEmitter
