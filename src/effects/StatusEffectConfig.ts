import { expect, unwrap } from '../helpers/assertions'
import { requireElement } from '../helpers/require-element'
import DurationEditors from './DurationEditors'
import template from './StatusEffectConfig.hbs'

/** A streamlined editor for status effects. */
export default class StatusEffectConfig extends ActiveEffectConfig
{
    static override get defaultOptions(): ActiveEffectConfig.Options
    {
        return {
            ...super.defaultOptions,
            classes: ['sheet'],
            template,
            width: 400,
        }
    }

    override get title(): string
    {
        const actorName = unwrap(this.document.parent).name
        const effectName = this.document.data.label
        return `${effectName} on ${actorName}`
    }

    override activateListeners(html: JQuery): void
    {
        super.activateListeners(html)

        // Add duration editor support:
        DurationEditors.initEditorsInForm(html)

        // Add image picker support:
        if (this.isEditable)
        {
            html.find('img[data-edit]')[0].addEventListener('click', ev => this._onEditImage(ev))
        }

        // Initial focus:
        if (this.document.data.label == 'New effect')
        {
            const initial = requireElement(html, 'label', HTMLInputElement)
            initial.setSelectionRange(0, initial.value.length)
            initial.focus()
        }
    }

    _onEditImage(event: MouseEvent)
    {
        const img = event.currentTarget
        expect(img instanceof HTMLImageElement)

        const filePicker = new FilePicker({
            type: 'image',
            current: img.getAttribute('src') ?? undefined,
            callback: path => img.src = path,
            top: unwrap(this.position.top) + 40,
            left: unwrap(this.position.left) + 10
        })

        // @ts-expect-error
        return filePicker.browse()
    }
}
