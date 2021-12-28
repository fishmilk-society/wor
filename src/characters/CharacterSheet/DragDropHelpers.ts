import { expect } from '../../helpers/assertions'
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

    export function init()
    {
        document.addEventListener('dragover', evt =>
        {
            if (!evt.defaultPrevented && evt.dataTransfer)
                evt.dataTransfer.dropEffect = 'none'
        })
    }
}
