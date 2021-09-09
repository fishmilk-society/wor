import { unwrap } from "../../helpers/assertions"
import { formatDate } from "../../helpers/format-date"
import { Logs } from "../lib:Logs"

let _instance: LogsSheet | undefined

export class LogsSheet extends Application
{
    static get instance(): LogsSheet
    {
        return _instance ??= new LogsSheet()
    }

    static override get defaultOptions(): Application.Options
    {
        return {
            ...super.defaultOptions,
            id: 'wor.foundrymq.LogsViewer',
            title: 'FoundryMQ Logs',
            template: 'systems/wor/src/foundrymq/sheets/LogsSheet.hbs',
            width: 600,
            height: 500,
            resizable: true,
        }
    }

    private constructor()
    {
        super()

        Hooks.on('updateSetting', s =>
        {
            if (s.key == Logs.SETTINGS_KEY)
                this.render()
        })
    }

    override activateListeners(html: JQuery<HTMLElement>)
    {
        super.activateListeners(html)
    }

    override _getHeaderButtons()
    {
        const buttons = super._getHeaderButtons()

        if (unwrap(game.user).isGM)
            buttons.unshift({
                icon: 'fas fa-trash',
                label: 'Clear',
                class: 'clear',
                onclick: Logs.clear,
            })

        return buttons
    }

    override getData()
    {
        return {
            content: Logs.getFilteredLogs().map(i => `${formatDate(i.date)} — ${i.message}`)
        }
    }
}
