import Effect from './entities/effect'
import CharacterSheet from './sheets/character-sheet'
import EffectSheet from './sheets/effect-sheet'
import { watch } from './live-reload'

Hooks.once('init', function()
{
    Actors.unregisterSheet('core', ActorSheet)
    Actors.registerSheet('wor', CharacterSheet, {
        label: 'Character Sheet',
        types: ['character'],
        makeDefault: true
    })

    CONFIG.ActiveEffect.entityClass = Effect
    CONFIG.ActiveEffect.sheetClass = EffectSheet

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
