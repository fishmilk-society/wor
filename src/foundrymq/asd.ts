import { unwrap } from "../helpers/assertions"
import moduleName from "../helpers/module-name"

import { UpdateActorMessage } from '../../foundrymq/messages/UpdateActorMessage'
import { KEY, Log } from "./Log"
import { FoundryMQ } from "./FoundryMQ"

async function processMessage(message: UpdateActorMessage): Promise<void>
{
    const actorToModify = unwrap(game.actors).get(message.actorId)
    if (!actorToModify)
        throw new Error(`Unknown actor ${message.actorId}`)

    await actorToModify.update({
        data: {
            hp: message.attributes?.hp,
            heroLab: {
                lastUpdate: new Date().toISOString(),
                fileName: message.source?.file,
                characterName: message.source?.character,
            }
        },
    })
}

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

Hooks.once('ready', function()
{
    if (unwrap(game.user).isGM)
        FoundryMQ.on(`UpdateActor:v1:${game.world.id}`, processMessage)
})
