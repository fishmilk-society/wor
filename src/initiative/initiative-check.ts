import { replaceOnce } from '../helpers/replace-once'
import { promptForRoll } from './dialog'

type RollInitiativeOptions = Parameters<Combat['rollInitiative']>[1] & {
    dialog?: false
}

Hooks.on('init', function()
{
    CONFIG.Combat.entityClass = class extends CONFIG.Combat.entityClass
    {
        rollAll(options?: RollInitiativeOptions)
        {
            options = { ...options, dialog: false }
            return super.rollAll(options)
        }

        rollNPC(options?: RollInitiativeOptions)
        {
            options = { ...options, dialog: false }
            return super.rollNPC(options)
        }

        async rollInitiative(idsObj: string[] | string, options?: RollInitiativeOptions): Promise<Combat>
        {
            const ids = typeof idsObj === "string" ? [idsObj] : idsObj

            if (ids.length != 1 || options?.dialog === false)
            {
                return super.rollInitiative(idsObj, options)
            }

            const turn = this.turns.find(t => t._id == ids[0])!

            const roll = await promptForRoll(turn)
            if (roll == 'cancel')
                return this

            if (typeof roll == 'number')
            {
                // @ts-expect-error
                let formula = game.system.data.initiative
                formula = replaceOnce(formula, '1d20', roll + '')
                options = { ...options, formula }
            }

            return super.rollInitiative(idsObj, options)
        }
    }
})
