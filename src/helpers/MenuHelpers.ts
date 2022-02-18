type ContextMenu = Array<ContextMenuEntry>

export namespace MenuHelpers
{
    /** Remove any matching item(s) from the specified menu. */
    export function remove(menu: ContextMenu, ...namesToRemove: Array<string>): void
    {
        for (const name of namesToRemove)
            menu.findSplice(i => i.name == name)
    }

    /** Move any matching item(s) to the top of the menu. */
    export function moveToTop(menu: ContextMenu, ...namesToMove: Array<string>): void
    {
        for (let i = namesToMove.length - 1; i >= 0; i--)
        {
            const item = menu.findSplice(e => e.name == namesToMove[i])
            item && menu.unshift(item)
        }
    }

    /** Add new item(s) to the top of the menu. */
    export function insertAtTop(menu: ContextMenu, ...itemsToAdd: Array<ContextMenuEntry>): void
    {
        for (let i = itemsToAdd.length - 1; i >= 0; i--)
            menu.unshift(itemsToAdd[i])
    }
}
