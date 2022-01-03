import { expect, unwrap } from '../../helpers/assertions'
import { omitThisParameter } from '../../helpers/omitThisParameter'

export namespace DragDropHelpers
{
    export function fixCursorIn(window: Application)
    {
        expect(window.element.length == 1)

        const target = window.element[0]
        expect(target instanceof HTMLElement)

        target.addEventListener('dragover', evt =>
        {
            if (!evt.defaultPrevented && evt.dataTransfer)
                evt.dataTransfer.dropEffect = 'none'
        })
    }

    /**
     * Highlight the current drop target. This method also adds a listener to
     * later un-highlight the drop target.
     */
    export function highlight(event: DragEvent)
    {
        expect(event.currentTarget instanceof HTMLElement)
        event.currentTarget.classList.add('targeted')
        event.currentTarget.ondragleave ??= dragleave
    }

    const dragleave = omitThisParameter(function(this: HTMLElement, event: DragEvent)
    {
        if (event.relatedTarget instanceof HTMLElement)
        {
            if (event.relatedTarget.closest('[data-drop-target]') == this)
                return
        }

        this.classList.remove('targeted')
    })

    /**
     * Determine the current drop target. This method also un-highlights it.
     */
    export function getDropTarget(event: DragEvent)
    {
        expect(event.currentTarget instanceof HTMLElement)
        event.currentTarget.classList.remove('targeted')
        return event.currentTarget.dataset.dropTarget
    }

    /**
     * Display an error indicating the object being dropped is invalid. This
     * method also un-highlights the current drop target.
     */
    export function unsupported(event: DragEvent): Promise<unknown>
    {
        DragDropHelpers.getDropTarget(event)
        unwrap(ui.notifications).error(`Unsupported drop object`)
        return Promise.resolve()
    }
}
