/**
 * @file
 * Due to the asynchronous and distributed nature of Hero Lab Sync, it can be beneficial to keep
 * logs of all FoundryMQ-related events. This library is designed to do that.
 *
 * Note that the FoundryMQ listeners only run on the GM’s machine. This library stores the logs in
 * a {@link Setting} so that all users can view them.
 */

import { unwrap } from '../helpers/assertions'
import { MODULE, getFullKey } from '../helpers/module-name'
import { truncateArray } from '../helpers/truncate-array'

/** The settings key used to persist logs. */
const KEY = 'mqLogs'

/** {@link KEY} but module-prefixed. */
const FULL_KEY = getFullKey(KEY)

/** A single entry in the logs. */
type LogEntry = { date: number; message: string }

// Type definitions for this setting:
declare global
{
    namespace ClientSettings
    {
        interface Values { [FULL_KEY]: Array<LogEntry> }
    }
}

// Runtime declaration of this setting:
Hooks.on('init', function()
{
    game.settings.register(MODULE, KEY, {
        scope: 'world',
        default: [],
        config: false,
    })
})

/**
 * A service for retrieving and modifying the FoundryMQ logs.
 */
export const Logs =
{
    /**
     * The module-prefixed settings key used for persisting logs. Don’t use this key to access the
     * setting directly.
     */
    SETTINGS_KEY: FULL_KEY,

    /**
     * Writes an entry to the logs.
     * @param message The text content of the log entry.
     */
    async append(message: string): Promise<void>
    {
        // TODO: Check whether this method is subject to race conditions

        // Read the log:
        const items = game.settings.get(MODULE, KEY)

        // Add the new entry:
        items.push({ date: Date.now(), message: message })

        // Ensure the log does not grow too big:
        truncateArray(items, 100)

        // Write the log:
        await game.settings.set(MODULE, KEY, items)
    },

    /**
     * Clears all log entries.
     */
    async clear(): Promise<void>
    {
        await game.settings.set(MODULE, KEY, [])
    },

    /**
     * Retrieves all log entries that the current user has permission to view.
     */
    getFilteredLogs(): Array<LogEntry>
    {
        // Retrieve all log entries:
        const items = game.settings.get(MODULE, KEY)

        // If GM, return all entries:
        if (unwrap(game.user).isGM)
            return items

        // Otherwise, heuristically exclude GM-only entries:
        return items.filter(i => !i.message.includes('C:\\\\Users'))
    },
}
