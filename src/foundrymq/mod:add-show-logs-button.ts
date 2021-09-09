import { LogsSheet } from "./sheets/LogsSheet"

Hooks.on('renderSettings', function(_, html)
{
    const newButton = $(`<button><i class="fas fa-align-justify"></i>FoundryMQ Logs</button>`)

    newButton.on('click', () =>
    {
        LogsSheet.instance.render(true)
    })

    html.find('#settings-game').append(newButton)
})
