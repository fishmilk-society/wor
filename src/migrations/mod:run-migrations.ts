import { expect, unwrap } from '../helpers/assertions'
import { getFullKey, MODULE } from '../helpers/module-name'
import { migrateTo_0_3 } from './lib:migrate-to-0.3'

const KEY = 'dataVersion'
const FULL_KEY = getFullKey(KEY)

type DataVersion = '<=0.2' | '0.3'
const LATEST: DataVersion = '0.3'

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
        default: '<=0.2',
        config: false,
    })
})

Hooks.once('ready', async function()
{
    if (!unwrap(game.user).isGM)
        return

    if (game.settings.get(MODULE, KEY) == LATEST)
        return

    const output = Array<string>()
    try
    {
        unwrap(ui.notifications).warn('Running migrations…')

        await migrate({ from: '<=0.2', to: '0.3' }, migrateTo_0_3, output)

        if (!output.length)
            output.push(`Unexpected data version ‘${game.settings.get(MODULE, KEY)}’`)
    }
    finally
    {
        await new Dialog({
            title: 'Migration results',
            content: output.join("\n"),
            buttons: {},
            default: ''
        }).render(true)
    }
})

async function migrate({ from, to }: { from: DataVersion, to: DataVersion }, migrator: () => Promise<Array<string>>, output: Array<string>): Promise<void>
{
    if (game.settings.get(MODULE, KEY) != from)
        return

    try
    {
        const results = await migrator()
        output.push(`<h3>Migrated to ${to}</h3><ul>${results.map(r => `<li>${r}</li>`).join("")}</ul>`)
        await game.settings.set(MODULE, KEY, to)
    }
    catch (ex)
    {
        output.push(`<h3>Failed to migrate to ${to}</h3><p>${ex}</p>`)
        throw ex
    }
}
