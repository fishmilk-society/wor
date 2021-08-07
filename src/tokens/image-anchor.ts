/**
 * @file
 * This module adds ‘x/y offset’ sliders to the token configuration dialog. These sliders can be
 * used to modify the position of the token image relative to its base.
 */

import { requireElement } from "../helpers/require-element"

/**
 * The relevant flags for this module.
 */
type TokenFlags = {
    wor?: {
        anchor?: { x: number; y: number }
    }
}

/**
 * This method is like `getFlag` but faster. That’s important since this method may be called quite
 * often.
 */
function getAnchorFast(token: Token): { x: number; y: number } | undefined
{
    const flags = token.data.flags as TokenFlags
    return flags.wor?.anchor
}

/**
 * Add UI to the token configuration dialog.
 */
Hooks.on('renderTokenConfig', function(config, html)
{
    // Find the ‘scale’ slider, since we’ll be adding the offset fields underneath that:
    const scaleSlider = requireElement(html, 'scale', HTMLInputElement)

    // Get the current value of the offset fields:
    const anchor = getAnchorFast(config.token) ?? { x: 0.5, y: 0.5 }

    // Add the offset fields:
    $(scaleSlider).closest('.form-group').after(`
         <div class='form-group'>
             <label>X Offset <span class='units'>(Ratio)</span>:</label>
             <div class='form-fields'>
                 <input type='range' name='flags.wor.anchor.x' value='${anchor.x}' min='0' max='1' step='0.01' data-dtype='Number'>
                 <span class='range-value'>${anchor.x}</span>
             </div>
         </div>
         <div class='form-group'>
             <label>Y Offset <span class='units'>(Ratio)</span>:</label>
             <div class='form-fields'>
                 <input type='range' name='flags.wor.anchor.y' value='${anchor.y}' min='0' max='1' step='0.01' data-dtype='Number'>
                 <span class='range-value'>${anchor.y}</span>
             </div>
         </div>`)

    // Resize the UI:
    config.setPosition()
})

/**
 * Add the ‘offset’ functionality into the {@link Token} class.
 */
Token.prototype.refresh = (function()
{
    const original = Token.prototype.refresh

    return function(this: Token): Token
    {
        original.apply(this)

        const anchor = getAnchorFast(this)
        if (anchor)
        {
            const icon = this.icon!
            const scale = 1 / this.data.scale
            icon.pivot.set(
                icon.texture.width * (0.5 - anchor.x) * scale,
                icon.texture.height * (0.5 - anchor.y) * scale
            )
        }

        return this
    }
})()
