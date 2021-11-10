import './allow-negative-hp'
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
import { StatusEffectConfig } from "./_new/StatusEffectConfig"
import { Notifier } from './_new/Notifier'
import { Scheduler } from './_new/Scheduler'

Hooks.once('init', function()
{
    CONFIG.time.roundTime = 6

    CONFIG.ActiveEffect.documentClass = StatusEffect
    CONFIG.Token.documentClass = Flop
    CONFIG.ActiveEffect.sheetClass = StatusEffectConfig
})

Hooks.once('ready', function()
{
    Scheduler.init()
    Notifier.init()
})

if (DEBUG)
{
    watch({
        prefix: 'systems/wor/',
        intervalInSeconds: 1,
    })
}
