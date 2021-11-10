import { unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'

import template from './StatusEffectConfig.hbs'

export class StatusEffectConfig extends ActiveEffectConfig
{
    static override get defaultOptions(): ActiveEffectConfig.Options
    {
        return {
            ...super.defaultOptions,
            template
        }
    }

    override async getData(options?: Application.RenderOptions): Promise<StatusEffectConfig.Data>
    {
        const context: StatusEffectConfig.Data = await super.getData(options)

        const d = context.data.duration
        if (d.seconds)
            d.string = Duration.fromSeconds(d.seconds).toString()

        else
            d.string = ''

        return context
    }

    protected override _updateObject(event: any, formData: any)
    {
        const d = formData.duration
        if (d.string)
        {
            try
            {
                d.seconds = Duration.parse(d.string).toSeconds()
            }
            catch (err: any)
            {
                unwrap(ui.notifications).error(`Could not parse duration: ${err.message}`)
                throw err
            }
        }
        else
        {
            d.seconds = null
        }
        delete d.string

        return super._updateObject(event, formData)
    }
}

namespace StatusEffectConfig
{
    export type Data = ActiveEffectConfig.Data & {
        data: {
            duration: {
                string?: string
            }
        }
    }
}
