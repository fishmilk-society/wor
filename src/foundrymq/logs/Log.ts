import { unwrap } from "../../helpers/assertions"
import { MODULE, getFullKey } from "../../helpers/module-name"

const KEY = 'mqLogs'
const FULL_KEY = getFullKey(KEY)

declare global
{
    namespace ClientSettings
    {
        interface Values { [FULL_KEY]: Array<{ date: number; message: string }> }
    }
}

Hooks.on('init', function()
{
    game.settings.register(MODULE, KEY, {
        config: false,
        default: [],
        scope: 'world',
    })
})

const MAX_LOG_SIZE = 100

function append(message: string): void
{
    const items = game.settings.get(MODULE, KEY)
    items.push({
        date: Date.now(),
        message: message,
    })

    const purgeCount = items.length - MAX_LOG_SIZE
    if (purgeCount > 0)
        items.splice(0, purgeCount)

    game.settings.set(MODULE, KEY, items)
}

function read(): Array<{ date: Date, message: string }>
{
    let items = game.settings.get(MODULE, KEY)

    if (!unwrap(game.user).isGM)
    {
        items = items.filter(i => !i.message.includes('C:\\\\Users'))
    }

    return items.map(i => ({
        date: new Date(i.date),
        message: i.message,
    }))
}

function clear(): void
{
    game.settings.set(MODULE, KEY, [])
}

export const Logs =
{
    SETTINGS_KEY: FULL_KEY,
    append,
    read,
    clear,
}
