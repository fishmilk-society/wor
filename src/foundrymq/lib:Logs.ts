import { unwrap } from "../helpers/assertions"
import { MODULE, getFullKey } from "../helpers/module-name"

/* this setting’s key */
const KEY = 'mqLogs'
const FULL_KEY = getFullKey(KEY)

/* type definitions for this setting */
declare global
{
    namespace ClientSettings
    {
        interface Values
        {
            [FULL_KEY]: Array<{ date: number; message: string }>
        }
    }
}

/* Foundry declaration of this setting */
Hooks.on('init', function()
{
    game.settings.register(MODULE, KEY, {
        scope: 'world',
        default: [],
        config: false,
        onChange() { _sheet?.render() }
    })
})

let _sheet: LogsSheet | undefined

export const Logs =
{
    get sheet(): LogsSheet
    {
        return _sheet ??= new LogsSheet()
    },

    append(message: string): void
    {
        const items = game.settings.get(MODULE, KEY)

        items.push({ date: Date.now(), message })

        purge(items, 100)

        game.settings.set(MODULE, KEY, items)
    },
}

class LogsSheet extends Application
{
    static override get defaultOptions(): Application.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/foundrymq/templates/LogsSheet.hbs',
            width: 600,
            height: 500,
            resizable: true,
            title: 'FoundryMQ Logs',
        }
    }

    override _getHeaderButtons()
    {
        const buttons = super._getHeaderButtons()

        if (unwrap(game.user).isGM)
            buttons.unshift({
                icon: 'fas fa-trash',
                label: 'Clear',
                class: 'clearLogs',
                onclick: clearLogs,
            })

        return buttons
    }

    override getData()
    {
        return {
            content: getFilteredLogs().map(i => `${formatDate(i.date)} — ${i.message}`)
        }
    }
}

function clearLogs(): Promise<unknown>
{
    return game.settings.set(MODULE, KEY, [])
}

function formatDate(date: number | Date): string
{
    date = new Date(date)

    const today = new Date()
    if (date.toDateString() == today.toDateString())
        return `Today at ${date.toLocaleTimeString('en-NZ')}`

    return date.toLocaleString('en-NZ').replace(', ', ' at ')
}

function getFilteredLogs()
{
    const items = game.settings.get(MODULE, KEY)

    if (unwrap(game.user).isGM)
        return items

    return items.filter(i => !i.message.includes('C:\\\\Users'))
}

function purge<T>(array: Array<T>, downTo: number): void
{
    const purgeCount = array.length - downTo
    if (purgeCount > 0)
        array.splice(0, purgeCount)
}
