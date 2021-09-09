import { Logs } from "./lib:Logs"

Hooks.on('renderSettings', function(_, html)
{
    const newButton = $(`<button><i class="fas fa-align-justify"></i>FoundryMQ Logs</button>`)

    newButton.on('click', () =>
    {
        Logs.sheet.render(true)
    })

    html.find('#settings-game').append(newButton)
})
