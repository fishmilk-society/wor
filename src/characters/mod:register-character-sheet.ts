import { CharacterSheet } from "./CharacterSheet"

// Register the character sheet on startup:
Hooks.once('init', function()
{
    Actors.unregisterSheet('core', ActorSheet)

    Actors.registerSheet('wor', CharacterSheet, {
        label: 'Character Sheet',
        types: ['character'],
        makeDefault: true
    })
})

// If world time is updated, re-render any visible character sheets:
Hooks.on('updateWorldTime', function()
{
    for (const key in ui.windows)
    {
        const window = ui.windows[key]
        if (window instanceof CharacterSheet)
            window.render()
    }
})
