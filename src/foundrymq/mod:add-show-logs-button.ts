/**
 * @file
 * This module adds a “show logs” button to the {@link Settings} tab. This button will display the
 * FoundryMQ logs.
 *
 * This button is available for non-GM users as well, though the logs will be filtered.
 */

import { LogsSheet } from './sheets/LogsSheet'

/**
 * When rendering the Settings tab, inject a new button.
 */
Hooks.on('renderSettings', function(_, html)
{
    // Create it:
    const newButton = $(`<button style='margin-top: 1rem'>
        <i class='fas fa-align-justify'></i>${LogsSheet.defaultOptions.title}
    </button>`)

    // Make it do stuff:
    newButton.on('click', () =>
    {
        LogsSheet.instance.render(true)
    })

    // Add it underneath the “Return to Setup” button:
    html.find('#settings-game').append(newButton)
})
