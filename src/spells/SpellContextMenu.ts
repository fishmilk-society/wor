import { expect, unwrap } from '../helpers/assertions'
import { ReceiveSpellDialog } from './ReceiveSpellDialog'

export namespace SpellContextMenu
{
    export function init()
    {
        type F = WithThisParameter<ItemDirectory['_getEntryContextOptions'], ItemDirectory>

        libWrapper.register<F>('wor', 'ItemDirectory.prototype._getEntryContextOptions', function(original)
        {
            const items = original()
            items.unshift(CAST_ON_TARGETED_CREATURES)
            return items
        }, 'WRAPPER')
    }

    const CAST_ON_TARGETED_CREATURES: ContextMenuEntry = {
        name: 'Cast on targeted creatures',
        icon: '<i class="fas fa-magic"></i>',
        condition: li => itemFromHtml(li).type == 'spell',
        callback(li)
        {
            const spell = itemFromHtml(li)
            const targets = getTargetedActors()
            if (targets)
                new ReceiveSpellDialog({ spell, targets }).render(true)
        }
    }

    function itemFromHtml(li: JQuery): Item
    {
        const entityId = li.data('entityId')
        const document = unwrap(game.items).get(entityId)
        return unwrap(document)
    }

    function getTargetedActors(): Array<Actor> | null
    {
        expect(ui.notifications)

        const targets = new Array<Actor>()
        let warning = false

        for (const token of unwrap(game.user).targets)
        {
            if (token.actor && token.actor.type == 'character')
                targets.push(token.actor)
            else
                warning = true
        }

        if (warning)
            ui.notifications.warn('Non-character targets have been ignored.')

        if (targets.length == 0)
        {
            ui.notifications.error('Target one or more creatures.')
            return null
        }

        return targets
    }
}
