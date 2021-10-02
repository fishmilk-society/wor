/**
 * @file
 * This module makes sliders and color pickers update interactively. See the comments in the switch
 * statement below for more info.
 */

// Listen to all ‘input’ events on the page:
document.addEventListener('input', function(evt): void
{
    const input = evt.target
    if (!(input instanceof HTMLInputElement))
        return

    switch (input.type)
    {
        /**
         * When the user drags a slider, immediately update its associated label.
         */
        case 'range':
            $(input).siblings('.range-value').text(input.value)
            break

        /**
         * When the user picks a color, immediately update its associated form field. Trigger an
         * event for that field as if it had been typed into.
         */
        case 'color':
            $(input).siblings('.color').val(input.value).trigger('input')
            break

        /**
         * When the user types a color, immediately update its associated color picker.
         */
        case 'text':
            if (input.classList.contains('color'))
                $(input).siblings('[type=color]').val(input.value)
            break
    }
})
