import { unwrap } from '../helpers/assertions'
import { requireElement } from '../helpers/require-element'
import '../initiative/dialog.sass'
import template from './ReceiveSpellDialog.hbs'
import { ReceiveSpellCommand } from './ReceiveSpellCommand'

type FormData = {
    cl: number
    extended: boolean
}

interface RenderContext
{
    vm: {
        multiple: boolean
        spell: { img: string, name: string }
        targetNames: string
    }
}

/**
 * Implements an ‘initiative check’ dialog.
 */
export class ReceiveSpellDialog extends FormApplication<FormApplication.Options, RenderContext>
{
    #spell: Item
    #targets: Array<Actor>

    static override get defaultOptions(): FormApplication.Options
    {
        return {
            ...super.defaultOptions,
            template,
            title: 'Receive Spell',
            width: 300,
        }
    }

    constructor(params: { spell: Item; targets: Array<Actor> })
    {
        super({})
        this.#spell = params.spell
        this.#targets = [...params.targets]
    }

    override getData(): RenderContext
    {
        return {
            vm: {
                multiple: this.#targets.length >= 2,
                spell: { img: this.#spell.img!, name: this.#spell.name! },
                targetNames: this.#command().targetNames
            }
        }
    }

    override activateListeners(html: JQuery)
    {
        super.activateListeners(html)

        // Find the UI elements:
        const cl = requireElement(html, 'cl', HTMLInputElement)

        // Allow the user to press escape to cancel the prompt:
        cl.addEventListener('keydown', event =>
        {
            if (event.key == 'Escape')
                this.close()
        })

        // Dynamically update the duration:
        unwrap(this.form).addEventListener('input', () => this.#renderDuration())
        this.#renderDuration()

        // Ensure the field has initial focus:
        cl.focus()
    }

    #renderDuration(): void
    {
        const span = requireElement(this.element, 'duration', HTMLElement)
        try
        {
            span.textContent = this.#command().duration.toString()
        }
        catch
        {
            span.textContent = '???'
        }
    }

    override async _updateObject(_: Event, __: FormData)
    {
        this.#command().execute()
    }

    #command(): ReceiveSpellCommand
    {
        const formData = this.form ? this._getSubmitData() as Partial<FormData> : {}

        return new ReceiveSpellCommand({
            cl: formData.cl!,
            extended: formData.extended!,
            spell: this.#spell,
            targets: this.#targets,
        })
    }
}
