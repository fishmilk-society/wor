import { CharacterSheet } from './sheets/character-sheet'
import { watch } from './live-reload'

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

watch({
    prefix: 'systems/wor/',
    intervalInSeconds: 1,
})
