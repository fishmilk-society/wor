import { CharacterSheet } from './sheets/character-sheet.js'

declare const Actors: any
declare const ActorSheet: any
declare const Hooks: any

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
