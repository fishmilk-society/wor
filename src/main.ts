import './entities/effect.js'
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

const preCreateEffect: Hooks.PreCreateEmbeddedEntity<ActiveEffectData, Actor> =
    function(parent, data, options, userId)
    {
        data.duration ??= {}
        data.duration.startTime = game.time.worldTime
        return true
    }
Hooks.on('preCreateActiveEffect', preCreateEffect)

watch({
    prefix: 'systems/wor/',
    intervalInSeconds: 1,
})
