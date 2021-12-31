import { expect, unwrap } from "../helpers/assertions"
import { ReceiveSpellDialog } from "./ReceiveSpellDialog"

export namespace SpellContextMenu
{
    export function init()
    {
        configureItemContextMenu()
        configureFolderContextMenu()
    }

    function configureItemContextMenu()
    {
        type F = WithThisParameter<ItemDirectory['_getEntryContextOptions'], ItemDirectory>

        libWrapper.register<F>('wor', 'ItemDirectory.prototype._getEntryContextOptions', function(original)
        {
            const items = original()
            MenuHelpers.remove(items, 'FOLDER.Clear', 'ITEM.ViewArt', 'SIDEBAR.Duplicate', 'SIDEBAR.Export', 'SIDEBAR.Import')
            MenuHelpers.moveToTop(items, 'PERMISSION.Configure')
            MenuHelpers.insertAtTop(items, CAST_ON_TARGETED_CREATURES)
            return items
        }, 'WRAPPER')
    }

    function configureFolderContextMenu()
    {
        type F = WithThisParameter<ItemDirectory['_getFolderContextOptions'], ItemDirectory>

        libWrapper.register<F>('wor', 'ItemDirectory.prototype._getFolderContextOptions', function(original)
        {
            const items = original()
            MenuHelpers.remove(items, 'FOLDER.CreateTable', 'FOLDER.Export')
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
        const entityId = li.data("entityId")
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

    namespace MenuHelpers
    {
        export function remove(menu: Array<ContextMenuEntry>, ...namesToRemove: Array<string>): void
        {
            for (const name of namesToRemove)
                menu.findSplice(i => i.name == name)
        }

        export function moveToTop(menu: Array<ContextMenuEntry>, ...namesToMove: Array<string>): void
        {
            for (let i = namesToMove.length - 1; i >= 0; i--)
            {
                const item = menu.findSplice(e => e.name == namesToMove[i])
                item && menu.unshift(item)
            }
        }

        export function insertAtTop(menu: Array<ContextMenuEntry>, ...itemsToAdd: Array<ContextMenuEntry>): void
        {
            for (let i = itemsToAdd.length - 1; i >= 0; i--)
                menu.unshift(itemsToAdd[i])
        }
    }
}
