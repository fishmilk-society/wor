import { expect } from '../helpers/assertions'
import { delay } from '../helpers/delay'
import Instant from '../helpers/Instant'

declare global
{
    namespace Hooks
    {
        export interface StaticCallbacks
        {
            momentChanged(now: Instant): void
        }
    }
}

namespace MomentChangedEmitter
{
    let last: Instant

    export function init()
    {
        last = Instant.now
        Hooks.on('updateCombat', checkForChange)
        Hooks.on('updateWorldTime', checkForChange)
        Hooks.on('momentChanged', n => console.log('momentChanged', n))
    }

    async function checkForChange()
    {
        // Sanity check:
        expect(last)

        // Retrieve the current moment:
        const now = Instant.now

        // If this was misfire, just exit:
        if (last.equals(now))
            return

        // Delay and debounce:
        await delay(100)
        if (!now.equals(Instant.now))
            return

        // Lastly, emit the event:
        Hooks.callAll('momentChanged', now)
        last = now
    }
}

export default MomentChangedEmitter
