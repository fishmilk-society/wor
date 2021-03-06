/**
 * @file
 * This module is used to display an ‘initiative check’ dialog.
 */

import { CharacterData } from "../data/CharacterData"
import './dialog.sass'
import template from './dialog.hbs'
import { renderPartial } from '../helpers/renderPartial'

/**
 * The result of {@link promptForRoll}. A number indicates the value the user entered. The string
 * ‘use-rng’ indicates that the user clicked submit but did not enter a value. The string ‘cancel’
 * indicates that the user dismissed the dialog.
 */
type Result = number | 'use-rng' | 'cancel'

/**
 * Displays an ‘initiative check’ dialog, prompting the user to make an initiative roll.
 */
export function promptForRoll(turn: Combatant): Promise<Result>
{
    return new Promise(resolve =>
    {
        const dialog = new Dialog(turn, resolve)
        dialog.render(true)
    })
}

/**
 * Implements an ‘initiative check’ dialog.
 */
class Dialog extends FormApplication<FormApplication.Options, { turn: Combatant; modifier: number }>
{
    static override get defaultOptions(): FormApplication.Options
    {
        return {
            ...super.defaultOptions,
            template,
            title: 'Initiative check',
            width: 300
        }
    }

    constructor(
        private readonly turn: Combatant,
        private readonly resolve: (result: Result) => void)
    {
        super({})
    }

    override async _updateObject(_event: Event, formData: any)
    {
        const { result } = formData

        // If the field has a value:
        if (typeof result == 'number')
            return this.resolve(result)

        // If the field was left blank:
        if (result === null)
            return this.resolve('use-rng')

        throw new Error('Form data did not match expectations')
    }

    override getData()
    {
        // Get the relevant character for this dialog:
        const actorData = this.turn.actor?.data.data as CharacterData

        // Get their current initiative modifier:
        const modifier = actorData.attributes.init

        return { turn: this.turn, modifier: modifier }
    }

    /**
     * Updates just the ‘note’ section.
     */
    async renderNote()
    {
        renderPartial(this, '.wor-note')
    }

    override activateListeners(html: JQuery)
    {
        super.activateListeners(html)

        // Find the UI elements:
        const inputField = this.element.find('.wor-input')[0] as HTMLInputElement
        const submitButton = this.element.find('.wor-submit')[0] as HTMLButtonElement

        // Allow the user to press escape to cancel the prompt:
        inputField.addEventListener('keydown', event =>
        {
            if (event.key == 'Escape')
                this.close()
        })

        // Update the button caption when the value changes:
        inputField.addEventListener('input', () =>
        {
            if (inputField.value != '')
                submitButton.classList.add('has-value')
            else
                submitButton.classList.remove('has-value')
        })

        // Ensure the field has initial focus:
        inputField.focus()
    }

    override close(options?: Application.CloseOptions)
    {
        // Resolve the promise (this is a no-op if `_updateObject` has already been called):
        this.resolve('cancel')

        return super.close(options)
    }
}

/**
 * If an actor’s initiative modifier was changed, we need to update any dialogs.
 */
Hooks.on('updateActor', function(_, update)
{
    maybeUpdateDialogs(update, '')
})

/**
 * If an unlinked token’s initiative modifier was changed, we need to update any dialogs.
 */
Hooks.on('updateToken', function(_, __, update)
{
    maybeUpdateDialogs(update, 'actorData.')
})

/**
 * Checks whether any initiative modifiers were updated. If so, this method will update any open
 * initiative check dialogs.
 */
function maybeUpdateDialogs(update: object, keyPrefix: string): void
{
    // Determine the key to the character’s initiative modifier:
    const key = keyPrefix + 'data.attributes.init'

    // If the modifier was included in this update:
    if (getProperty(update, key) !== undefined)
    {
        // Then just do a partial re-render of every initiative check dialog:
        for (const key in ui.windows)
        {
            const window = ui.windows[key]
            if (window instanceof Dialog)
                window.renderNote()
        }
    }
}
