import { unwrap } from "../../helpers/assertions"
import { Logs } from "./Log"

let _instance: Viewer | undefined

export class Viewer extends Application
{
    public static get instance(): Viewer
    {
        return _instance ??= new Viewer()
    }

    public static override get defaultOptions(): Application.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/foundrymq/logs/Viewer.hbs',
            width: 600,
            height: 500,
            resizable: true,
            title: 'FoundryMQ Logs',
        }
    }

    private constructor()
    {
        super()

        Hooks.on('updateSetting', setting =>
        {
            if (setting.key == Logs.SETTINGS_KEY)
            {
                if (this.rendered)
                    this.render(true)
            }
        })
    }

    protected override _getHeaderButtons()
    {
        const buttons = super._getHeaderButtons()
        if (unwrap(game.user).isGM)
        {
            buttons.unshift({
                label: 'Clear',
                class: 'clear',
                icon: 'fas fa-trash',
                onclick: () => Logs.clear(),
            })
        }
        return buttons
    }

    public override getData(): { content: Array<string> }
    {
        const content = Logs.read().map(i => `${i.date.toLocaleString()} ${i.message}`)
        return { content }
    }
}
