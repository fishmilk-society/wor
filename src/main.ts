import './allow-negative-hp'
import './active-effects'
import './tokens/high-precision-scale'
import './tokens/image-anchor'
import './tokens/preview-changes'
import './initiative'
import './update-slider-values'
import { watch } from './live-reload.js'
import { CharacterSheet } from './sheets/character-sheet.js'

import './foundrymq/mod:add-show-logs-button'
import './foundrymq/mod:handle-update-actor-messages'
import './migrations/mod:migrate-from-0.2.0'

Hooks.once('init', function()
{
    Actors.unregisterSheet('core', ActorSheet)

    // TODO: remove this cast
    Actors.registerSheet('wor', CharacterSheet as any, {
        label: 'Character Sheet',
        types: ['character'],
        makeDefault: true
    })

    console.log('WOR | Initialized')
})

if (DEBUG)
{
    watch({
        prefix: 'systems/wor/',
        intervalInSeconds: 1,
    })
}
