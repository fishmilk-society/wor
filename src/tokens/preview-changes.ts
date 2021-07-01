/**
 * @file
 * TODO
 */

import MODULE from "../helpers/module-name"
import { requireElement } from "../helpers/require-element"
import LibWrapper from "../helpers/strongly-typed-lib-wrapper"

const KEYS_TO_PREVIEW = [
    'mirrorX',
    'mirrorY',
    'scale',
    'flags.wor.anchor.x',
    'flags.wor.anchor.y',
    'displayName',
    'displayBars',
]

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

        let oldData

        // If the dialog does not exist or is not visible:
        if (sheet?.rendered)
        {
            // Retrieve all the properties we’ll be changing:
            oldData = duplicate(this.data)

            const o = new FormDataExtended(sheet.form as HTMLFormElement, {}).toObject()
            for (let [k, v] of Object.entries(o))
            {
                if (KEYS_TO_PREVIEW.includes(k))
                    setProperty(this.data, k, v)
            }
        }
        original()

        const anchor = getAnchorFast(this)
        if (anchor)
            this.icon!.position.set(
                this.w * anchor.x,
                this.h * anchor.y
            )

        // Update those properties based on the current UI state:
        // this.data.scale = getScaleSlider(html).valueAsNumber

        // Call the refresh method:
        // original()

        if (oldData)
            // Revert the properties we changed:
            Object.assign(this.data, oldData)

        // this.icon!.position.set(
        //     this.w * getXOffsetSlider(html).valueAsNumber,
        //     this.h * getYOffsetSlider(html).valueAsNumber
        // )
    })
})

// type Anchor = { x: number, y: number }

// function getAnchor(token: Token): Anchor
// {
//     const savedValue = token.getFlag(MODULE, 'anchor') as Anchor
//     return savedValue ?? { x: 0.5, y: 0.5 }
// }

// async function setAnchor(token: Token, values: Partial<Anchor>): Promise<void>
// {
//     const mergedValue = { ...getAnchor(token), ...values }
//     await token.setFlag(MODULE, 'anchor', mergedValue)
// }

function getAnchorFast(token: Token): { x: number; y: number } | undefined
{
    const flags = token.data.flags as {
        wor?: {
            anchor?: {
                x: number
                y: number
            }
        }
    }

    return flags.wor?.anchor
}

/**
 * When showing the token configuration dialog, attach some listeners.
 */
Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function({ token }, html)
{
    // If this dialog is for a prototype token, do nothing:
    if (!token.icon)
        return

    html.on('input', function()
    {
        token.refresh()
    })
})

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

    //new FormDataExtended(canvas.tokens.controlled[0].sheet.form).toObject()


    // const xOffsetSlider = getXOffsetSlider(html)
    // const yOffsetSlider = getYOffsetSlider(html);

    // [scaleSlider, xOffsetSlider, yOffsetSlider].forEach(s =>
    //     // When you modify the ‘scale’ slider, re-render the token:
    //     s.addEventListener('input', () =>
    //     {
    //         token.refresh()
    //     })
    // )
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
