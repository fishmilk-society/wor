import { unwrap } from "../helpers/assertions"
import moduleName from "../helpers/module-name"

namespace foundrymq
{
    export type Message = {
        id: number
        actorId: string
        hp?: { value?: number, max?: number }
    }
}

async function processMessage(message: foundrymq.Message): Promise<void>
{
    const actorToModify = unwrap(game.actors).get(message.actorId)
    if (!actorToModify)
        throw new Error(`Unknown actor ${message.actorId}`)

    await actorToModify.update({
        data: {
            hp: message.hp,
        },
    })
}

function delay(ms: number): Promise<void>
{
    return new Promise(resolve => setTimeout(resolve, ms))
}

const KEY = 'heroLabLog'

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

class HeroLabLogViewer extends Application
{
    static instance: HeroLabLogViewer | undefined

    static override get defaultOptions(): Application.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/foundrymq/asd.hbs',
            width: 400,
            height: 400,
            resizable: true,
            title: 'Hero Lab Logs',
        }
    }

    override _getHeaderButtons()
    {
        const buttons = super._getHeaderButtons()
        if (unwrap(game.user).isGM)
        {
            buttons.unshift({
                label: 'Clear',
                class: 'clear',
                icon: 'fas fa-trash',
                onclick: () => Log.clear(),
            })
        }
        return buttons
    }

    override getData(): object
    {
        return {
            content: game.settings.get(moduleName, KEY)
        }
    }
}

declare global
{
    interface Game
    {
        heroLab: {
            showLogs: () => void
        }
    }
}

Hooks.on('init', function()
{
    game.heroLab = {
        showLogs(): void
        {
            HeroLabLogViewer.instance ??= new HeroLabLogViewer()
            HeroLabLogViewer.instance.render(true)
        }
    }

    game.settings.register(moduleName, KEY, {
        scope: 'world',
        config: false,
        default: [],
        type: Array,
        onChange: () =>
        {
            if (HeroLabLogViewer.instance?.rendered)
                HeroLabLogViewer.instance.render(true)
        },
    })
})

namespace Log
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

    export function writeError(message: string): void
    {
        write('[ERROR] ' + message)
    }
}

async function startQueueListener()
{
    const queueId = game.world.id

    let lastMessageId: number

    type PollOnceResult = 'retry-after-delay' | 'retry-immediately'

    async function pollOnce(): Promise<PollOnceResult>
    {
        let response: Response
        try
        {
            response = await fetch(`/mq/${queueId}/oldest?wait=50`)
        }
        catch (ex)
        {
            Log.writeError('An exception occurred: ' + ex.message)
            return 'retry-after-delay'
        }

        if (response.status == 204)
            return 'retry-immediately'

        if (response.status != 200)
        {
            Log.writeError(`An unknown error occurred (${response.status})`)
            return 'retry-after-delay'
        }

        let message: foundrymq.Message
        try
        {
            message = await response.json() as foundrymq.Message
        }
        catch (ex)
        {
            Log.writeError('An exception occurred: ' + ex.message)
            return 'retry-after-delay'
        }

        if (message.id != lastMessageId)
        {
            Log.write('Processing message ' + JSON.stringify(message))
            try
            {
                await processMessage(message)
            }
            catch (ex)
            {
                Log.writeError('An exception occurred: ' + ex.message)
            }
            lastMessageId = message.id
        }

        try
        {
            response = await fetch(`/mq/${queueId}/${message.id}`, { method: 'DELETE' })
        }
        catch (ex)
        {
            Log.writeError('An exception occurred: ' + ex.message)
            return 'retry-after-delay'
        }

        if (response.status != 200)
        {
            Log.writeError(`An unknown error occurred (${response.status})`)
            return 'retry-after-delay'
        }

        return 'retry-immediately'
    }

    while (true)
    {
        const result = await pollOnce()

        if (result == 'retry-after-delay')
            await delay(10_000)
    }
}

Hooks.once('ready', function()
{
    if (unwrap(game.user).isGM)
        startQueueListener()
})
