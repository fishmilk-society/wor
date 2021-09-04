import { MODULE, MODULE as moduleName } from "../../helpers/module-name"

export const KEY = 'heroLabLog'

declare global
{
    namespace ClientSettings
    {
        interface Values
        {
            'wor.heroLabLog': Array<string>
        }
    }
}

export namespace Log
{
    const MAX_LOG_SIZE = 100

    export function clear(): void
    {
        game.settings.set(moduleName, KEY, [])
    }

    export function write(line: string): void
    {
        const items = game.settings.get(moduleName, KEY)
        line = new Date().toISOString() + ' ' + line

        items.push(line)

        const purgeCount = items.length - MAX_LOG_SIZE
        if (purgeCount > 0)
            items.splice(0, purgeCount)

        game.settings.set(moduleName, KEY, items)
    }
}

Hooks.on('init', function()
{
    game.settings.register(MODULE, KEY, {
        scope: 'world',
        config: false,
        default: [],
        type: Array
    })
})
