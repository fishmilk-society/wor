import '../characters/CharacterSheet/styles.sass'
import DurationEditors from '../effects/DurationEditors'
import template from './SpellConfig.hbs'

export class SpellConfig extends ItemSheet
{
    static override get defaultOptions(): ItemSheet.Options
    {
        return {
            ...super.defaultOptions,
            closeOnSubmit: true,
            resizable: false,
            submitOnChange: false,
            template,
            width: 400,
            height: 'auto',
        }
    }

    override activateListeners(html: JQuery): void
    {
        super.activateListeners(html)
        DurationEditors.initEditorsInForm(html)
    }

    static register()
    {
        Items.registerSheet('wor', this, {
            types: ['spell'],
            makeDefault: true
        })
    }
}
