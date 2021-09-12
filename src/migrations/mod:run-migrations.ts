/**
 * @file
 * The data structure for WOR is constantly evolving. This module ensures that no data is lost as
 * these evolutions occur.
 *
 * Upon loading a world created with an older version of WOR, this module migrate that world’s
 * entities to fit the latest data structure.
 */

import { unwrap } from '../helpers/assertions'
import { MODULE } from '../helpers/module-name'
import { migrateTo_0_3 } from './lib:migrate-to-0.3'

// To ensure migrations only happen once for a given world, this module uses a {@link Setting}
// to store which version of WOR’s data structure the world uses.
//
// This setting is called the “data version.” Note that data versions are a subset of WOR’s actual
// versions – only versions that neccessitate migration are included as possible values.
type DataVersion = '<=0.2' | '0.3'

// Useful constants:
namespace DataVersion
{
    export const DEFAULT: DataVersion = '<=0.2'
    export const LATEST: DataVersion = '0.3'
}

// Setting definition:
namespace DataVersion
{
    const KEY = 'dataVersion'

    Hooks.once('init', function()
    {
        game.settings.register(MODULE, KEY, { config: false, default: DEFAULT, scope: 'world' })
    })

    export function get(): DataVersion
    {
        return game.settings.get(MODULE, KEY) as DataVersion
    }

    export function set(value: DataVersion): Promise<unknown>
    {
        return game.settings.set(MODULE, KEY, value)
    }
}

// Run migrations once the game has fully loaded:
Hooks.once('ready', async function()
{
    // Only GMs can run migrations:
    if (!unwrap(game.user).isGM)
        return

    // If we’re up-to-date, do nothing:
    if (DataVersion.get() == DataVersion.LATEST)
        return

    const output = Array<string>()
    try
    {
        // Inform the GM that something is happening:
        unwrap(ui.notifications).warn('Running migrations…')

        // Sequentially migrate each version:
        await migrate({ from: '<=0.2', to: '0.3' }, migrateTo_0_3, output)

        // If no output was written, then no migrations have happened. This means that the world’s
        // current “data version” is something invalid:
        if (!output.length)
            output.push(`<p>Unexpected data version ‘${DataVersion.get()}’<p>`)
    }
    finally
    {
        // We may leave this function via success or via an exception. Either way, show what output
        // was already written.
        await new Dialog({
            title: 'Migration results',
            content: output.join("\n"),
            buttons: {},
            default: ''
        }).render(true)
    }
})

/** Helper function for performing a single migration. */
async function migrate({ from, to }: { from: DataVersion, to: DataVersion }, migrator: () => Promise<Array<string>>, output: Array<string>): Promise<void>
{
    // Only this migration for worlds that need it:
    if (DataVersion.get() != from)
        return

    try
    {
        // Run the migration:
        const results = await migrator()

        // Prettily write the migration results:
        output.push(`<h3>Migrated to ${to}</h3><ul>${results.map(r => `<li>${r}</li>`).join("")}</ul>`)

        // Update the world’s data version:
        await DataVersion.set(to)
    }
    catch (ex)
    {
        // Add some info for the GM:
        output.push(`<h3>Failed to migrate to ${to}</h3><p>${ex}</p>`)

        // Re-throw the exception so that no other migrations run:
        throw ex
    }
}
