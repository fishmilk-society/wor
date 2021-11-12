import { expect } from '../helpers/assertions'
import Duration from '../helpers/duration'

export namespace DurationEditors
{
    /** Finds and initializes any duration editors found in this form. */
    export function initEditorsInForm(form: HTMLElement | ArrayLike<HTMLElement>)
    {
        // If the input was a jQuery result, unwrap it:
        if ('length' in form)
        {
            expect(form.length == 1)
            form = form[0]
        }

        // Make sure this element is actually a <form/>:
        expect(form instanceof HTMLFormElement)

        // Find and initialize all the duration editors:
        for (const durationEditor of form.querySelectorAll('[data-duration-editor]'))
        {
            expect(durationEditor instanceof HTMLInputElement)
            init(durationEditor)
        }
    }

    /** Initializes one specific duration editor. */
    function init(editor: HTMLInputElement)
    {
        // Make some sanity checks:
        expect(editor.form)
        expect(editor.dataset.durationEditor?.length)
        expect(!editor.name)

        // Find the field that this editor wraps:
        const storage = editor.form.querySelector(`[name='${editor.dataset.durationEditor}']`)
        expect(storage instanceof HTMLInputElement)

        // Retrieve the value if it has one:
        if (storage.valueAsNumber)
            editor.value = Duration.fromSeconds(storage.valueAsNumber).toString()

        // Whenever the user interacts with this editor:
        editor.addEventListener('input', function()
        {
            if (editor.value)
            {
                try
                {
                    // Store the parsed value:
                    storage.valueAsNumber = Duration.parse(editor.value).toSeconds()
                    editor.setCustomValidity('')
                }
                catch (err: any)
                {
                    // Don’t let the user submit an invalid duration:
                    editor.setCustomValidity(err.message)
                }
            }

            else
            {
                // Store a blank value:
                storage.value = ''
                editor.setCustomValidity('')
            }
        })
    }
}
