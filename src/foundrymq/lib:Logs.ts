import { unwrap } from "../helpers/assertions"
import { MODULE, getFullKey } from "../helpers/module-name"
import { truncateArray } from "../helpers/truncate-array"

/* this setting’s key */
const KEY = 'mqLogs'
const FULL_KEY = getFullKey(KEY)

/* type definitions for this setting */
type Entry = { date: number; message: string }
declare global
{
    namespace ClientSettings
    {
        interface Values { [FULL_KEY]: Array<Entry> }
    }
}

/* Foundry declaration of this setting */
Hooks.on('init', function()
{
    game.settings.register(MODULE, KEY, {
        scope: 'world',
        default: [],
        config: false,
    })
})

export const Logs =
{
    SETTINGS_KEY: FULL_KEY,

    async append(message: string): Promise<void>
    {
        const items = game.settings.get(MODULE, KEY)

        items.push({ date: Date.now(), message: message })

        truncateArray(items, 100)

        await game.settings.set(MODULE, KEY, items)
    },

    async clear(): Promise<void>
    {
        await game.settings.set(MODULE, KEY, [])
    },

    getFilteredLogs(): Array<Entry>
    {
        const items = game.settings.get(MODULE, KEY)

        if (unwrap(game.user).isGM)
            return items

        return items.filter(i => !i.message.includes('C:\\\\Users'))
    },
}
