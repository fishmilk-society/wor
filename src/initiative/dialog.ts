import { CharacterData } from '../entities/actor'
import './dialog.sass'

type Result = number | 'use-rng' | 'cancel'

export function promptForRoll(turn: Combat.Combatant): Promise<Result>
{
    return new Promise(resolve =>
    {
        const dialog = new DialogImpl(turn, resolve)
        dialog.render(true)
    })
}

class DialogImpl extends Application
{
    static get defaultOptions(): Application.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/initiative/dialog.hbs',
            title: 'Initiative check',
            width: 300
        }
    }

    constructor(
        private readonly turn: Combat.Combatant,
        private readonly resolve: (result: Result) => void)
    {
        super()
    }

    getData()
    {
        const actorData = this.turn.actor?.data.data as CharacterData
        const modifier = actorData.initiative.final
        return { turn: this.turn, modifier: modifier }
    }

    async renderPartial(selector: string)
    {
        const newHtml = await renderTemplate(this.template, this.getData())
        const newNote = $(newHtml).find(selector)
        this.element.find(selector).replaceWith(newNote)
    }

    get inputField(): HTMLInputElement
    {
        return this.element.find('.wor-input')[0] as HTMLInputElement
    }

    get submitButton(): HTMLButtonElement
    {
        return this.element.find('.wor-submit')[0] as HTMLButtonElement
    }

    activateListeners(html: JQuery)
    {
        super.activateListeners(html)

        this.inputField.addEventListener('input', () =>
        {
            if (this.inputField.value != '')
                this.submitButton.classList.add('has-value')
            else
                this.submitButton.classList.remove('has-value')
        })

        this.submitButton.addEventListener('click', (ev) =>
        {
            ev.preventDefault()
            ev.stopPropagation()

            const result = this.inputField.value
            if (result != '')
                this.resolve(parseInt(result))
            else
                this.resolve('use-rng')

            this.close()
        })

        this.inputField.focus()
    }
}

Hooks.on<Hooks.UpdateEntity<Actor.Data>>('updateActor', function(_, update)
{
    if (getProperty(update, 'data.initiative.final') !== undefined)
    {
        for (const key in ui.windows)
        {
            const window = ui.windows[key]
            if (window instanceof DialogImpl)
                window.renderPartial('.wor-note')
        }
    }
})
