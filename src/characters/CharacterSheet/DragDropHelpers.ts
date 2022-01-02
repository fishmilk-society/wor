import { expect, unwrap } from '../../helpers/assertions'
import { omitThisParameter } from '../../helpers/omitThisParameter'

export namespace DragDropHelpers
{
    const dragleave = omitThisParameter(function(this: HTMLElement, event: DragEvent)
    {
        if (event.relatedTarget instanceof HTMLElement)
        {
            if (event.relatedTarget.closest('[data-drop-target]') == this)
                return
        }

        this.classList.remove('targeted')
    })

    export function highlight(event: DragEvent)
    {
        expect(event.currentTarget instanceof HTMLElement)
        event.currentTarget.classList.add('targeted')
        event.currentTarget.ondragleave ??= dragleave
    }

    export function getDropTarget(event: DragEvent)
    {
        expect(event.currentTarget instanceof HTMLElement)
        event.currentTarget.classList.remove('targeted')
        return event.currentTarget.dataset.dropTarget
    }

    export function unsupported(event: DragEvent): Promise<unknown>
    {
        DragDropHelpers.getDropTarget(event)
        unwrap(ui.notifications).error('Cannot create status effect: unsupported drop object')
        return Promise.resolve()
    }

    export function init()
    {
        document.addEventListener('dragover', evt =>
        {
            const a = evt.target
            if (a instanceof HTMLElement)
            {
                if (a.closest('.forien-quest-preview'))
                    return
            }

            if (!evt.defaultPrevented && evt.dataTransfer)
                evt.dataTransfer.dropEffect = 'none'
        })
    }
}
