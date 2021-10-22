import './allow-negative-hp'
import './active-effects'
import './initiative'
import { watch } from './live-reload.js'

import './characters/mod:register-character-sheet'
import './foundrymq/mod:add-show-logs-button'
import './foundrymq/mod:handle-update-actor-messages'
import './general/mod:more-interactive-fields'
import './migrations/mod:run-migrations'
import './tokens/mod:high-precision-scale'
import './tokens/mod:image-anchor'
import './tokens/mod:preview-changes'
import './tokens/mod:use-actor-size'
import { Flop, StatusEffect } from './_new/StatusEffect'

Hooks.once('init', function()
{
    CONFIG.time.roundTime = 6

    CONFIG.ActiveEffect.documentClass = StatusEffect
    CONFIG.Token.documentClass = Flop
})

Hooks.once('ready', function()
{
    StatusEffect.Scheduler.init()
})

declare global
{
    interface DocumentClassConfig
    {
        ActiveEffect: typeof StatusEffect
    }

    interface FlagConfig
    {
        ActiveEffect: {
            'wor'?: {
                'expired'?: boolean
            }
        }
    }
}

if (DEBUG)
{
    watch({
        prefix: 'systems/wor/',
        intervalInSeconds: 1,
    })
}
