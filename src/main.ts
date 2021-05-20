import { CharacterSheet } from './sheets/character-sheet'
import { watch } from './live-reload'

Hooks.once('init', function()
{
    // TODO: custom edit sheet for active effects

    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('wor', CharacterSheet, {
        label: 'Character Sheet',
        types: ['character'],
        makeDefault: true
    })

    console.log('WOR | Initialized')
})

Hooks.on('preCreateActiveEffect', function(_1: any, data: ActiveEffectData)
{
    data.duration ??= {}
    data.duration.startTime = game.time.worldTime
})

watch({
    prefix: 'systems/wor/',
    intervalInSeconds: 1,
})
