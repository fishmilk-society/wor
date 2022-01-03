import './allow-negative-hp'
import './initiative'
import { watch } from './live-reload.js'

import './foundrymq/mod:add-show-logs-button'
import './foundrymq/mod:handle-update-actor-messages'
import './general/mod:more-interactive-fields'
import './migrations/mod:run-migrations'
import './tokens/mod:high-precision-scale'
import './tokens/mod:image-anchor'
import './tokens/mod:preview-changes'
import './tokens/mod:use-actor-size'
import StatusEffect from './effects/StatusEffect'
import StatusEffectConfig from "./effects/StatusEffectConfig"
import StatusEffectNotifier from './effects/StatusEffectNotifier'
import StatusEffectScheduler from './effects/StatusEffectScheduler'
import MomentChangedEmitter from "./effects/MomentChangedEmitter"
import { LowLightVision } from './rendering/LowLightVision'
import { CharacterSheet } from './characters/CharacterSheet'

LowLightVision.registerHooks()

Hooks.once('init', function()
{
    CONFIG.time.roundTime = 6

    Actors.unregisterSheet('core', ActorSheet)
    CharacterSheet.register()

    CONFIG.ActiveEffect.documentClass = StatusEffect
    CONFIG.ActiveEffect.sheetClass = StatusEffectConfig
})

Hooks.once('ready', function()
{
    MomentChangedEmitter.init()
    StatusEffectNotifier.init()
    StatusEffectScheduler.init()
})

if (DEBUG)
{
    watch({
        prefix: 'systems/wor/',
        intervalInSeconds: 1,
    })
}
