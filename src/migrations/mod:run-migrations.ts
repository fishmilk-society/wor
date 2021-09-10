import { expect, unwrap } from '../helpers/assertions'
import { getFullKey, MODULE } from '../helpers/module-name'
import { migrateTo_0_2_1 } from './lib:migrate-to-0.2.1'

const KEY = 'dataVersion'
const FULL_KEY = getFullKey(KEY)

type DataVersion = '<=0.2.0' | '0.2.1'

declare global
{
    namespace ClientSettings
    {
        interface Values { [FULL_KEY]: DataVersion }
    }
}

Hooks.once('init', function()
{
    game.settings.register(MODULE, KEY, {
        scope: 'world',
        default: '<=0.2.0',
        config: false,
    })
})

Hooks.once('ready', async function()
{
    if (!unwrap(game.user).isGM)
        return

    expect(ui.notifications)

    MIGRATE_LOOP: while (true)
    {
        const migratedFrom = game.settings.get(MODULE, KEY)
        switch (migratedFrom)
        {
            case '<=0.2.0':
                ui.notifications.warn('Migrating…')
                await migrateTo_0_2_1()
                await game.settings.set(MODULE, KEY, '0.2.1')
                ui.notifications.warn('Migrated to 0.2.1')
                continue MIGRATE_LOOP

            case '0.2.1':
                break MIGRATE_LOOP

            default:
                ui.notifications.error(`Unexpected data version ‘${migratedFrom}’`)
                break MIGRATE_LOOP
        }
    }
})
