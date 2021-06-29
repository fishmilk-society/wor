import './allow-negative-hp'
import './active-effects'
import './tokens/high-precision-scale'
import './tokens/preview-changes'
import './initiative'
import './update-slider-values'
import { watch } from './live-reload.js'
import { CharacterSheet } from './sheets/character-sheet.js'

Hooks.once('init', function()
{
    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('wor', CharacterSheet, {
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
