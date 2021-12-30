import { Spell } from '../characters/CharacterSheet/Spell'
import StatusEffect from '../effects/StatusEffect'
import { expect, unwrap } from '../helpers/assertions'
import { requireElement } from '../helpers/require-element'
import '../initiative/dialog.sass'
import template from './SpellDurationDialog.hbs'

type Params = { spell: Item, targets: Array<Actor> }
type FormData = { cl: number, extended: boolean }

interface ViewModel
{
    spell: { img: string, name: string }
    targetNames: string
}

/** Joins a set of items in an English-friendly way. */
function andify(items: Array<string>): string
{
    if (items.length == 0)
        return ''
    else if (items.length == 1)
        return items[0]
    else if (items.length == 2)
        return items.join(' and ')
    else
        return items.slice(0, -1).join(', ') + ', and ' + items.at(-1)
}

/**
 * Implements an ‘initiative check’ dialog.
 */
export class SpellDurationDialog extends FormApplication<FormApplication.Options, ViewModel>
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

    constructor(params: Params)
    {
        super({})
        this.#spell = params.spell
        this.#targets = [...params.targets]
    }

    override getData(): ViewModel
    {
        return {
            spell: { img: this.#spell.img!, name: this.#spell.name! },
            targetNames: andify(this.#targets.map(t => t.name!))
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
        unwrap(this.form).addEventListener('input', () => this.updateDuration())
        this.updateDuration()

        // Ensure the field has initial focus:
        cl.focus()
    }

    updateDuration()
    {
        const span = requireElement(this.element, 'duration', HTMLElement)

        try
        {
            const formData = this._getSubmitData() as FormData
            const duration = Spell.calculateDuration(this.#spell, formData)
            span.textContent = duration.toString()
        }
        catch
        {
            span.textContent = '???'
        }
    }

    override async _updateObject(_: Event, formData: FormData)
    {
        const seconds = Spell.calculateDuration(this.#spell, formData).toSeconds()

        const effectData = {
            label: this.#spell.data.name,
            icon: this.#spell.data.img,
            duration: { seconds },
            flags: {
                wor: {
                    cl: formData.cl
                }
            }
        }

        const promises = this.#targets.map(target =>
        {
            return StatusEffect.create(effectData, { parent: target })
        })

        await Promise.all(promises)
    }
}
