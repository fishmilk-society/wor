/**
 * @file
 * This module makes it so that changes to the token configuration dialog are made in real-time.
 * Such changes are a preview only and will be undone if the dialog is dismissed.
 */

import { expect } from "../helpers/assertions"

/**
 * This is a list of keys that are applied in {@link Token.refresh}, which is one of the methods
 * overridden by this module.
 */
const REFRESH_KEYS = new Set([
    'alpha',
    'displayBars',
    'displayName',
    'flags.wor.anchor.x',
    'flags.wor.anchor.y',
    'mirrorX',
    'mirrorY',
    'scale'
])

const DRAW_AURA_KEYS = new Set([
    'flags.token-auras.aura1.colour',
    'flags.token-auras.aura1.distance',
    'flags.token-auras.aura1.opacity',
    'flags.token-auras.aura1.permission',
    'flags.token-auras.aura1.square',
    'flags.token-auras.aura2.colour',
    'flags.token-auras.aura2.distance',
    'flags.token-auras.aura2.opacity',
    'flags.token-auras.aura2.permission',
    'flags.token-auras.aura2.square'
])

declare global
{
    interface Token
    {
        drawAuras(this: Token): void
    }
}

const isAugmented = Symbol('isAugmented')
declare global
{
    interface Token
    {
        [isAugmented]?: true
    }
}

namespace Helpers
{
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

    function injectTokenData(token: Token, keysToUpdate: Set<string>): { undo(): void }
    {
        // Retrieve all the properties we’ll be changing:
        const realData = duplicate(token.data)

        // Get the form data from the open dialog:
        const sheet = findSheet(token)
        expect(sheet?.form instanceof HTMLFormElement)
        const formData = new FormDataExtended(sheet.form, {}).toObject()

        // Apply a specific subset of ‘previewable’ properties from that form data:
        for (const [key, value] of Object.entries(formData))
        {
            if (keysToUpdate.has(key))
                setProperty(token.data, key, value)
        }

        // Helper to revert our changes:
        function undo()
        {
            Object.assign(token.data, realData)
        }

        return { undo }
    }

    /**
     * This method wraps the ‘refresh’ method, making modifications to the token’s data before
     * calling the original. Those modifications come from the current state of the token
     * configuration dialog.
     */
    function augmentedRefresh(this: Token): Token
    {
        const injection = injectTokenData(this, REFRESH_KEYS)
        try
        {
            return Token.prototype.refresh.call(this)
        }
        finally
        {
            injection.undo()
        }
    }

    // todo
    function augmentedDrawAuras(this: Token): void
    {
        const injection = injectTokenData(this, DRAW_AURA_KEYS)
        try
        {
            return Token.prototype.drawAuras.call(this)
        }
        finally
        {
            injection.undo()
        }
    }

    /**
     * Augments a token to use {@link augmentedRefresh}.
     */
    export function enablePreview(token: Token): void
    {
        if (!token[isAugmented])
        {
            token[isAugmented] = true
            token.drawAuras = augmentedDrawAuras
            token.refresh = augmentedRefresh
        }
    }

    /**
     * Undoes the effects of {@link enablePreview}.
     */
    export function disablePreview(token: Token): void
    {
        if (token[isAugmented])
        {
            delete token[isAugmented]
            // @ts-expect-error
            delete token.drawAuras
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
    html.on('input', function(evt)
    {
        expect(evt.target instanceof HTMLInputElement)

        if (REFRESH_KEYS.has(evt.target.name))
            token.refresh()

        if (DRAW_AURA_KEYS.has(evt.target.name))
            token.drawAuras()
    })
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

    // Update the token again (in case the user discarded their changes):
    token.drawAuras()
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
