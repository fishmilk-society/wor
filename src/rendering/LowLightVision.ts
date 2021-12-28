import { expect, unwrap } from '../helpers/assertions'
import { requireElement } from '../helpers/require-element'
import { omitThisParameter } from '../helpers/omitThisParameter'

declare global
{
    // Add missing type definitions:
    interface PointSource
    {
        sourceType: 'light' | 'sight'
    }
}

/** Whether the canvas is currently being rendered with LLV. */
let active: boolean = false

/** GM override for LLV. */
let override: boolean | undefined

export const LowLightVision = new class
{
    registerHooks(): void
    {
        Hooks.once('init', onInit)
        Hooks.once('ready', onReady)
        Hooks.on('renderTokenConfig', onRenderTokenConfig)
    }

    get active(): boolean
    {
        return active
    }

    set active(value: boolean | undefined)
    {
        override = value

        // Trigger a rerender:
        canvas?.perception.schedule({
            lighting: { refresh: true },
            sight: { refresh: true }
        })
    }
}

function onInit()
{
    // This method occurs in-between clicking a token and rendering the lighting. It’s the
    // perfect hook to check for LLV.
    libWrapper.register('wor', 'PerceptionManager.prototype.schedule', function(wrapped, options = {})
    {
        const value = override ?? isEnabledForCurrentVisionSource()
        if (active !== value)
        {
            active = value
            setProperty(options, 'lighting.initialize', true)
            setProperty(options, 'sight.initialize', true)
        }
        return wrapped(options)
    }, 'WRAPPER')

    // Hook into light source updates.
    libWrapper.register('wor', 'PointSource.prototype.initialize', function(wrapped, data)
    {
        if (this.sourceType === 'light' && data)
        {
            applyToLightData(data)
        }
        return wrapped(data)
    }, 'WRAPPER')

    type F = WithThisParameter<Token['_onUpdate'], Token>

    // Trick Foundry into rerendering when we edit a token’s vision.
    libWrapper.register<F>('wor', 'Token.prototype._onUpdate', function(wrapped, data, options, userId)
    {
        if (data?.flags?.wor?.lowLightVision !== undefined)
        {
            data.dimSight = this.data.dimSight
        }
        return wrapped(data, options, userId)
    }, 'WRAPPER')
}

function onReady()
{
    if (unwrap(game.user).isGM)
    {
        type F = WithThisParameter<KeyboardManager['_handleKeys'], KeyboardManager>

        // Let the GM preview what LLV looks like.
        libWrapper.register<F>('wor', 'KeyboardManager.prototype._handleKeys', function(wrapped, event, key, up)
        {
            if (key == 'l')
                if (up)
                    LowLightVision.active = undefined
                else
                    LowLightVision.active = true
            else
                return wrapped(event, key, up)
        }, 'MIXED')
    }
}

/**
 * Whether the current source of vision has LLV.
 *
 * This method returns `false` if there are no vision sources. If there are multiple vision
 * sources, this method only returns `true` if they _all_ have LLV.
 */
function isEnabledForCurrentVisionSource(): boolean
{
    expect(canvas && canvas.tokens)

    let any = false

    for (const token of canvas.tokens.placeables)
        if (isVisionSource(token))
            if (isEnabledFor(token))
                any = true
            else
                return false

    return any
}

/** Whether the given token is (currently) a source of vision. */
const isVisionSource = omitThisParameter(function(this: Token, token: Token)
{
    return token._isVisionSource()
})

/** Whether the given token has LLV. */
function isEnabledFor(token: Token | TokenDocument): boolean
{
    return !!token.data.flags.wor?.lowLightVision
}

/** Extend the radii of the specified light. */
function applyToLightData(data: { dim?: number, bright?: number }): void
{
    if (active)
    {
        const dim = data.dim ?? 0
        const bright = data.bright ?? 0
        if (dim > bright)
        {
            data.dim = 2 * dim - bright
            data.bright = dim
        }
    }
}

/** Add a LLV checkbox to token configuration. */
function onRenderTokenConfig(config: TokenConfig, html: JQuery)
{
    const dimSightField = requireElement(html, 'dimSight', HTMLInputElement)

    const value = isEnabledFor(config.token)

    $(dimSightField).closest('.form-group').before(`
            <div class='form-group'>
                <label>Low-Light Vision</label>
                <input type='checkbox' name='flags.wor.lowLightVision' data-dtype='Boolean' ${value ? 'checked' : ''}>
            </div>`)

    config.setPosition()
}
