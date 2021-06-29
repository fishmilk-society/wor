/**
 * @file
 * This module makes it so that the ‘scale’ slider in the token configuration dialog provides live
 * updates.
 */

import MODULE from "../helpers/module-name"
import LibWrapper from "../helpers/strongly-typed-lib-wrapper"
import { getSlider } from "./element-helpers"

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
        {
            original()

            const anchor = getAnchor(this)

            this.icon!.position.set(
                this.w * anchor.x,
                this.h * anchor.y
            )

            return
        }

        // Retrieve all the properties we’ll be changing:
        const { scale } = this.data

        const html = sheet.element

        // Update those properties based on the current UI state:
        this.data.scale = getSlider(html, 'scale').valueAsNumber

        // Call the refresh method:
        original()

        // Revert the properties we changed:
        Object.assign(this.data, { scale })

        this.icon!.position.set(
            this.w * getSlider(html, 'flags.wor.anchor.x').valueAsNumber,
            this.h * getSlider(html, 'flags.wor.anchor.y').valueAsNumber
        )
    })
})

type Anchor = { x: number, y: number }

function getAnchor(token: Token): Anchor
{
    const savedValue = token.getFlag(MODULE, 'anchor') as Anchor
    return savedValue ?? { x: 0.5, y: 0.5 }
}

async function setAnchor(token: Token, values: Partial<Anchor>): Promise<void>
{
    const mergedValue = { ...getAnchor(token), ...values }
    await token.setFlag(MODULE, 'anchor', mergedValue)
}

/**
 * When showing the token configuration dialog, attach some listeners.
 */
Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function({ token }, html)
{
    // If this dialog is for a prototype token, do nothing:
    if (!token.icon)
        return

    // Retrieve the pertinent UI controls:
    const scaleSlider = getSlider(html, 'scale')

    const anchor = getAnchor(token)

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

    const xOffsetSlider = getSlider(html, 'flags.wor.anchor.x')
    const yOffsetSlider = getSlider(html, 'flags.wor.anchor.y');

    [scaleSlider, xOffsetSlider, yOffsetSlider].forEach(s =>
        // When you modify the ‘scale’ slider, re-render the token:
        s.addEventListener('input', () =>
        {
            token.refresh()
        })
    )
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
