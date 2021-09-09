import { LogsViewer } from "./logs/Viewer"

Hooks.on('renderSettings', function(_, html)
{
    const newButton = $(`<button><i class="fas fa-align-justify"></i>FoundryMQ Logs</button>`)

    newButton.on('click', () =>
    {
        new LogsViewer().render(true)
    })

    html.find('#settings-game').append(newButton)
})
