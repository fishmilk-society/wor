import { DurationEditors } from './DurationEditors'
import template from './StatusEffectConfig.hbs'

/** A streamlined editor for status effects. */
export class StatusEffectConfig extends ActiveEffectConfig
{
    static override get defaultOptions(): ActiveEffectConfig.Options
    {
        return {
            ...super.defaultOptions,
            template
        }
    }

    override activateListeners(jQuery: JQuery): void
    {
        super.activateListeners(jQuery)
        DurationEditors.initEditorsInForm(jQuery)
    }
}
