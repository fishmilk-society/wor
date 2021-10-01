/**
 * @file
 * This module makes it so that changes to the token configuration dialog are made in real-time.
 * Such changes are a preview only and will be undone if the dialog is dismissed.
 */

import { expect } from "../helpers/assertions"

/**
 * These are the keys supported by this module. All of these keys are applied in {@link
 * Token.refresh}, which is the hook used by this module.
 */
const PREVIEWABLE_KEYS = new Set([
    'alpha',
    'flags.wor.anchor.x',
    'flags.wor.anchor.y',
    'mirrorX',
    'mirrorY',
    'scale'
])

namespace Helpers
{
    const isAugmented = Symbol('isAugmented')
    interface AugmentableToken extends Token
    {
        [isAugmented]?: true
    }

    /**
     * Depending on how you open the token configuration dialog, it may not be linked via the
     * `token.sheet` property. This method, instead, searches all open windows to find the correct
     * dialog.
     */
    function findSheet(token: Token): TokenConfig | undefined
    {
        for (const key in ui.windows)
        {
            const sheet = ui.windows[key]
            if (sheet instanceof TokenConfig && sheet.token.id == token.id)
                return sheet
        }
        return undefined
    }

    /**
     * This method wraps the ‘refresh’ method, making modifications to the token’s data before
     * calling the original. Those modifications come from the current state of the token
     * configuration dialog.
     */
    function augmentedRefresh(this: AugmentableToken): AugmentableToken
    {
        const original = Token.prototype.refresh

        // Retrieve all the properties we’ll be changing:
        const realData = duplicate(this.data)

        // Get the form data from the open dialog:
        const sheet = findSheet(this)
        expect(sheet?.form instanceof HTMLFormElement)
        const formData = new FormDataExtended(sheet.form, {}).toObject()

        // Apply a specific subset of ‘previewable’ properties from that form data:
        for (const [key, value] of Object.entries(formData))
        {
            if (PREVIEWABLE_KEYS.has(key))
                setProperty(this.data, key, value)
        }

        // Call the real ‘refresh’ method:
        original.apply(this)

        // Revert the properties we changed:
        Object.assign(this.data, realData)

        return this
    }

    /**
     * Augments a token to use {@link augmentedRefresh}.
     */
    export function enablePreview(token: AugmentableToken): void
    {
        if (!token[isAugmented])
        {
            token[isAugmented] = true
            token.refresh = augmentedRefresh
        }
    }

    /**
     * Undoes the effects of {@link enablePreview}.
     */
    export function disablePreview(token: AugmentableToken): void
    {
        if (token[isAugmented])
        {
            delete token[isAugmented]
            // @ts-expect-error
            delete token.refresh
        }
    }
}

/**
 * When showing the token configuration dialog, attach some listeners and enable real-time preview
 * support.
 */
Hooks.on('renderTokenConfig', function(config, html)
{
    const token = getTokenFromConfig(config)

    // If this dialog is for a prototype token, do nothing:
    if (!token?.icon)
        return

    // Enable real-time previews for this token:
    Helpers.enablePreview(token)

    // Whenever this dialog is updated, update the real-time preview as well:
    html.on('input', () => token.refresh())
})

/**
 * When closing the token configuration dialog, disable real-time preview support.
 */
Hooks.on('closeTokenConfig', function(config)
{
    const token = getTokenFromConfig(config)

    // If this dialog is for a prototype token, do nothing:
    if (!token?.icon)
        return

    // Disable real-time previews for this token:
    Helpers.disablePreview(token)

    // Refresh the token, in case the user discarded their changes:
    token.refresh()
})

/**
 * This method gets the `Token` object associated with a given token configuration dialog.
 *
 * Note that the type definitions are wrong — `config.token` is a `TokenDocument` instance, not a
 * `Token` instance.
 *
 * When viewing the dialog for a prototype token, this method will return `undefined`.
 */
function getTokenFromConfig(config: TokenConfig): Token | undefined
{
    return (config.token as any)._object
}
