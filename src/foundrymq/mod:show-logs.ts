import { Viewer } from "./logs/Viewer"

// TODO: change the way that Logs is exported
// TODO: change the key to be plural
// TODO: remove `logs` folder, rename Viewer, give everything a `lib:` prefix

Hooks.on('renderSettings', function(_, html)
{
    const newButton = $(`<button><i class="fas fa-align-justify"></i>FoundryMQ Logs</button>`)

    newButton.on('click', () =>
    {
        Viewer.instance.render(true)
    })

    html.find('#settings-game').append(newButton)
})
