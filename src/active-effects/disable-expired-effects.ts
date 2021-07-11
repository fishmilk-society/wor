/**
 * @file
 * This module ensures that expired effect no longer affect actor properties or render an icon.
 */

import { wasExpiryTriggeredFor } from './expiry-messages'

/**
 * Mix functionality into the @see ActiveEffect class.
 */
Hooks.on('init', function()
{
    CONFIG.ActiveEffect.entityClass = class extends CONFIG.ActiveEffect.entityClass
    {
        override get isTemporary(): boolean
        {
            // If this effect is expired, don’t render an icon on the token:
            if (wasExpiryTriggeredFor(this))
                return false

            return super.isTemporary
        }

        override apply(...args: Parameters<ActiveEffect['apply']>): void
        {
            // If this effect is expired, don’t apply the adjustment:
            if (wasExpiryTriggeredFor(this))
                return

            super.apply(...args)
        }
    }
})
