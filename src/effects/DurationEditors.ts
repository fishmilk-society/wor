import { expect } from '../helpers/assertions'
import Duration from '../helpers/duration'

/**
 * With this module, users can enter strings like “1 mins” rather than entering
 * a number of seconds. See `StatusEffectConfig` for an example.
 */
namespace DurationEditors
{
    /** Finds and initializes any duration editors found in the specified form. */
    export function initEditorsInForm(form: HTMLElement | ArrayLike<HTMLElement>)
    {
        // If the input was a jQuery result, unwrap it:
        if ('length' in form)
        {
            expect(form.length == 1)
            form = form[0]
        }

        // Validate the input:
        expect(form instanceof HTMLFormElement)

        // Find the duration editors:
        for (const durationEditor of form.querySelectorAll('[data-duration-editor]'))
        {
            expect(durationEditor instanceof HTMLInputElement)
            init(durationEditor)
        }
    }

    function init(editor: HTMLInputElement)
    {
        // Sanity checks:
        expect(editor.form)
        expect(editor.dataset.durationEditor?.length)
        expect(!editor.name)

        // Find the field that this editor ‘wraps’:
        const storage = editor.form.querySelector(`[name='${editor.dataset.durationEditor}']`)
        expect(storage instanceof HTMLInputElement)

        // Retrieve the initial value (if it has one):
        if (storage.valueAsNumber)
            editor.value = Duration.fromSeconds(storage.valueAsNumber).toString()

        // Update the wrapped field whenever the user typed into this editor:
        editor.addEventListener('input', function()
        {
            if (editor.value)
            {
                try
                {
                    storage.valueAsNumber = Duration.parse(editor.value).toSeconds()
                    editor.setCustomValidity('')
                }
                catch (err: any)
                {
                    editor.setCustomValidity(err.message)
                }
            }
            else
            {
                storage.value = ''
                editor.setCustomValidity('')
            }
        })
    }
}

export default DurationEditors
