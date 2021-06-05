/**
 * @file
 * This module ensures that expired effect no longer affect actor properties or render an icon.
 */

import ExpiryMessageService from './expiry-message-service'

/**
 * Mix functionality into the @see ActiveEffect class.
 */
Hooks.on('init', function()
{
    CONFIG.ActiveEffect.entityClass = class extends CONFIG.ActiveEffect.entityClass
    {
        get isTemporary(): boolean
        {
            // If this effect is expired, don’t render an icon on the token:
            if (ExpiryMessageService.hasTriggeredFor(this))
                return false

            return super.isTemporary
        }

        apply(actor: Actor, change: ActiveEffectChange)
        {
            // If this effect is expired, don’t apply the adjustment:
            if (ExpiryMessageService.hasTriggeredFor(this))
                return

            super.apply(actor, change)
        }
    }
})
