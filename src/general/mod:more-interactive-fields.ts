/**
 * @file
 * This module makes sliders update as you’re dragging them.
 */

/**
 * If the user modifies a slider, then update the label next to it (if any).
 */
$(document).on('input', 'input[type=range]', function()
{
    $(this).siblings('.range-value').text(this.value)
})
