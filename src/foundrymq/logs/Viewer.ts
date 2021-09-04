import { unwrap } from "../../helpers/assertions"
import { MODULE } from "../../helpers/module-name"
import { KEY, Log } from "./Log"


Hooks.on('renderSettings', function(settings: Settings, html: JQuery<HTMLElement>, data: {})
{
    const archiveManagerHtml = $(`
        <div id="df-chat-enhance-settings" style="margin:0">
            <h4>foundrymq</h4>
            <button data-action="archive"><i class="fas fa-align-justify"></i></i>Logs</button>
        </div>`)

    archiveManagerHtml.on('click', () =>
    {
        game.heroLab.showLogs()
    })

    html.find('#settings-game').append(archiveManagerHtml)
})

class HeroLabLogViewer extends Application
{
    static instance: HeroLabLogViewer | undefined

    static override get defaultOptions(): Application.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/foundrymq/logs/Viewer.hbs',
            width: 400,
            height: 400,
            resizable: true,
            title: 'Hero Lab Logs',
        }
    }

    constructor(options?: Partial<Application.Options>)
    {
        super(options)

        Hooks.on('updateSetting', (a: Setting) =>
        {
            if (a.key == 'wor.heroLabLog')
            {
                if (this.rendered)
                    this.render(true)
            }
        })
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
            content: game.settings.get(MODULE, KEY)
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
            HeroLabLogViewer.instance.bringToTop()
        }
    }
})
