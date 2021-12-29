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
            height: 'auto',
            resizable: false,
            submitOnChange: false,
            submitOnClose: false,
            template,
            width: 400,
        }
    }

    override activateListeners(jQuery: JQuery): void
    {
        super.activateListeners(jQuery)
        DurationEditors.initEditorsInForm(jQuery)
    }

    static register()
    {
        Items.registerSheet('wor', this, {
            types: ['spell'],
            makeDefault: true
        })
    }
}
