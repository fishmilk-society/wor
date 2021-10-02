import './allow-negative-hp'
import './active-effects'
import './initiative'
import { watch } from './live-reload.js'
import { CharacterSheet } from './sheets/character-sheet.js'

import './foundrymq/mod:add-show-logs-button'
import './foundrymq/mod:handle-update-actor-messages'
import './general/mod:more-interactive-fields'
import './migrations/mod:run-migrations'
import './tokens/mod:high-precision-scale'
import './tokens/mod:image-anchor'
import './tokens/mod:preview-changes'
import './tokens/mod:use-actor-size'

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
