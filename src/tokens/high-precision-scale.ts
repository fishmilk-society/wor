/**
 * @file
 * This module increases the precision of the ‘scale’ slider in the token configuration dialog.
 */

import { getScaleSlider } from "./element-helpers"

/**
 * When rendering the token configuration dialog, make some changes to the controls.
 */
Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function(config, html)
{
    const element = getScaleSlider(html)

    // Decrease the range to increase the precision of mouse movements:
    element.min = '0.5'
    element.max = '2.0'

    // Increase the actual precision:
    element.step = '0.01'

    // Re-evaluate the ‘value’ property (since it would have already been rounded to 0.1):
    element.value = element.getAttribute('value')!
})

