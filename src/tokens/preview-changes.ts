/**
 * @file
 * This module makes it so that the ‘scale’ slider in the token configuration dialog provides live
 * updates.
 */

import LibWrapper from "../helpers/strongly-typed-lib-wrapper"
import { getScaleSlider } from "./element-helpers"

/**
 * Mix functionality into the {@link Token} class.
 */
Hooks.on('init', () =>
{
    LibWrapper.forClass(Token).forMethod('refresh').wrap(function(original)
    {
        // The public property is a lazy initiatilizer. We definitely don’t want to initialize
        // every token’s configuration dialog. Instead, access the private backing field:
        // @ts-expect-error
        const sheet = this._sheet

        // If the dialog does not exist or is not visible:
        if (!sheet?.rendered)
            return original()

        // Retrieve all the properties we’ll be changing:
        const { scale } = this.data

        // Update those properties based on the current UI state:
        this.data.scale = getScaleSlider(sheet.element).valueAsNumber

        // Call the refresh method:
        original()

        // Revert the properties we changed:
        return Object.assign(this.data, { scale })
    })
})

/**
 * When showing the token configuration dialog, attach some listeners.
 */
Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function({ token }, html)
{
    // If this dialog is for a prototype token, do nothing:
    if (!token.icon)
        return

    // Retrieve the pertinent UI controls:
    const scaleSlider = getScaleSlider(html)

    // When you modify the ‘scale’ slider, re-render the token:
    scaleSlider.addEventListener('input', () =>
    {
        token.refresh()
    })
})

/**
 * When the token configuration dialog is dismissed, re-render (in case the user cancelled):
 */
Hooks.on<Hooks.CloseApplication<TokenConfig>>('closeTokenConfig', function({ token })
{
    // If this dialog is for a prototype token, do nothing:
    if (!token.icon)
        return

    token.refresh()
})
