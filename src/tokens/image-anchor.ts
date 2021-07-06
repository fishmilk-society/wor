import { requireElement } from "../helpers/require-element"

type TokenFlags = {
    wor?: {
        anchor?: { x: number; y: number }
    }
}

function getAnchorFast(token: Token): { x: number; y: number } | undefined
{
    const flags = token.data.flags as TokenFlags
    return flags.wor?.anchor
}

/**
 * When showing the token configuration dialog, attach some listeners.
 */
Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function({ token }, html)
{
    // Retrieve the pertinent UI controls:
    const scaleSlider = requireElement(html, 'scale', HTMLInputElement)

    const anchor = getAnchorFast(token) ?? { x: 0.5, y: 0.5 }

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
})

Token.prototype.refresh = (function()
{
    const original = Token.prototype.refresh

    return function(this: Token)
    {
        original.apply(this)

        const anchor = getAnchorFast(this)
        if (anchor)
        {
            this.icon!.position.set(
                this.w * anchor.x,
                this.h * anchor.y
            )
        }
    }
})()
