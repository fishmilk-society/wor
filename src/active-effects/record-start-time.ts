/**
 * @file
 * This module ensures that newly-created effects have their ‘start time’ specified.
 */

/**
 * If an effect is being created, record the current time.
 */
Hooks.on('preCreateActiveEffect', function(_, data)
{
    // Modify the data this effect will be created with:
    data.duration = {}
    data.duration.startTime = game.time.worldTime

    // Continue with creation:
    return true
})
