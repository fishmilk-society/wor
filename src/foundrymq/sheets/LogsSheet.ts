import { unwrap } from '../../helpers/assertions'
import { formatDate } from '../../helpers/format-date'
import { Logs } from '../lib:Logs'

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

        // Refresh this window whenever the logs are updated:
        Hooks.on('updateSetting', s =>
        {
            if (s.key == Logs.SETTINGS_KEY)
                this.render()
        })
    }

    override _getHeaderButtons()
    {
        const buttons = super._getHeaderButtons()

        // Give GMs a button for clearing the logs:
        if (unwrap(game.user).isGM)
        {
            buttons.unshift({
                icon: 'fas fa-trash',
                label: 'Clear',
                class: 'clear',
                onclick: Logs.clear,
            })
        }

        return buttons
    }

    override getData(): { content: Array<string> }
    {
        return {
            content: Logs.getFilteredLogs().map(i => `${formatDate(i.date)} — ${i.message}`)
        }
    }
}
