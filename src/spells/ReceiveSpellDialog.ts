import { Spell } from '../characters/CharacterSheet/Spell'
import StatusEffect from '../effects/StatusEffect'
import { unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'
import { requireElement } from '../helpers/require-element'
import '../initiative/dialog.sass'
import { andify } from './andify'
import template from './ReceiveSpellDialog.hbs'
import { ReceiveSpellCommand } from './ReceiveSpellCommand'

type Params = { spell: Item, targets: Array<Actor> }
type FormData = { cl: number, extended: boolean }

interface RenderContext
{
    vm: {
        multiple: boolean
        needsGM: boolean
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

    constructor(params: Params)
    {
        super({})
        this.#spell = params.spell
        this.#targets = [...params.targets]
    }

    get #needsSocket(): boolean
    {
        return this.#targets.some(t => !t.isOwner)
    }

    override getData(): RenderContext
    {
        return {
            vm: {
                multiple: this.#targets.length >= 2,
                needsGM: this.#needsSocket,
                spell: { img: this.#spell.img!, name: this.#spell.name! },
                targetNames: andify(this.#targets.map(t => t.name!).sort())
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
            span.textContent = this.#calculateDuration().toString()
        }
        catch
        {
            span.textContent = '???'
        }
    }

    override async _updateObject(_: Event, formData: FormData)
    {
        new ReceiveSpellCommand({
            cl: formData.cl,
            extended: formData.extended,
            spell: this.#spell,
            targets: this.#targets,
        }).execute()

        // const payload: ReceiveSpell1.Payload = {
        //     cl: formData.cl,
        //     extended: formData.extended,
        //     spell: this.#spell.uuid,
        //     targets: this.#targets.map(t => t.uuid),
        // }

        // if (this.#needsSocket)
        // {
        //     await getSocket().executeAsGM('receiveSpell', {
        //         spell: this.#spell.uuid,
        //         targets: this.#targets.map(t => t.uuid),
        //         formData,
        //     })
        //     return
        // }

        // const seconds = this.#calculateDuration().toSeconds()

        // const effectData = {
        //     label: this.#spell.data.name,
        //     icon: this.#spell.data.img,
        //     duration: { seconds },
        //     flags: {
        //         wor: {
        //             cl: formData.cl
        //         }
        //     }
        // }

        // const promises = this.#targets.map(target =>
        // {
        //     return StatusEffect.create(effectData, { parent: target })
        // })

        // await Promise.all(promises)
    }

    #calculateDuration(): Duration
    {
        const formData = this._getSubmitData() as FormData
        const params = {
            cl: formData.cl,
            extended: formData.extended,
            targets: this.#targets.length,
        }
        return Spell.calculateDuration(this.#spell, params)
    }
}
