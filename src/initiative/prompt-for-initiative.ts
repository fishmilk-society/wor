/**
 * @file
 * This module shows a dialog when making an initiative check, allowing the user to roll manually
 * (instead of relying on RNG).
 */

import { expect, unreachable } from '../helpers/assertions'
import { replaceOnce } from '../helpers/replace-once'
import { promptForRoll } from './dialog'

/**
 * Augment the options parameter of the ‘roll’ functions:
 */
type RollInitiativeOptions = Parameters<Combat['rollInitiative']>[1] & {
    /**
     * If set to false, then this roll will not show a dialog and instead use RNG.
     */
    dialog?: false
}

/**
 * Mix functionality into the {@link Combat} class.
 */
Hooks.on('init', function()
{
    CONFIG.Combat.documentClass = class extends CONFIG.Combat.documentClass
    {
        override rollAll(options?: RollInitiativeOptions)
        {
            // Never show the dialog when the ‘roll all’ button is used:
            options = { ...options, dialog: false }
            return super.rollAll(options)
        }

        override rollNPC(options?: RollInitiativeOptions)
        {
            // Never show the dialog when the ‘roll NPCs’ button is used:
            options = { ...options, dialog: false }
            return super.rollNPC(options)
        }

        override async rollInitiative(idsObj: string | string[], options?: RollInitiativeOptions)
        {
            // With this option set, just do the default behaviour:
            if (options?.dialog === false)
                return super.rollInitiative(idsObj, options)

            // Get the ID from the first parameter:
            const id = idsObj instanceof Array ? idsObj[0] : idsObj

            // Get the turn data and show the dialog:
            const turn = this.turns.find(t => t._id == id)
            expect(turn)
            const rollResult = await promptForRoll(turn)

            // If the user clicked “Use RNG instead,” just do the default behaviour:
            if (rollResult == 'use-rng')
                return super.rollInitiative(idsObj, options)

            // If the user clicked cancel, do nothing:
            if (rollResult == 'cancel')
                return this

            // If the user entered a number, then override the initiative ‘formula’ for this roll:
            if (typeof rollResult == 'number')
            {
                let formula = (game.system.data as any).initiative
                formula = replaceOnce(formula, '1d20', rollResult + '')
                return super.rollInitiative(idsObj, { ...options, formula })
            }

            unreachable(rollResult)
        }
    }
})
