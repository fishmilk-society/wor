import { expect, unwrap } from "../helpers/assertions"
import { requireElement } from "../helpers/require-element"

declare global
{
    interface PointSource
    {
        sourceType: 'light' | 'sight'
    }

    interface FlagConfig
    {
        Token: {
            wor?: {
                lowLightVision?: boolean
            }
        }
    }
}

function omitThisParameter<Function>(fn: Function): OmitThisParameter<Function>
{
    return fn as OmitThisParameter<Function>
}

namespace wor.rendering
{
    let active: boolean = false
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
            unwrap(canvas).perception.schedule({
                lighting: { refresh: true },
                sight: { refresh: true }
            })
        }
    }

    function onInit()
    {
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

        libWrapper.register('wor', 'PointSource.prototype.initialize', function(wrapped, data = {})
        {
            if (this.sourceType === 'light')
                applyToLightData(data)

            return wrapped(data)
        }, 'WRAPPER')

        type F = WithThisParameter<Token['_onUpdate'], Token>

        libWrapper.register<F>('wor', 'Token.prototype._onUpdate', function(wrapped, data = {}, options, userId)
        {
            if (data.flags?.wor?.lowLightVision !== undefined)
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

    const isVisionSource = omitThisParameter(function(this: Token, token: Token)
    {
        return token._isVisionSource()
    })

    function isEnabledFor(token: Token): boolean
    {
        return !!token.data.flags.wor?.lowLightVision
    }

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
}

/* export interop */
type ThisModule = typeof wor.rendering.LowLightVision

declare global
{
    namespace wor.rendering
    {
        export const LowLightVision: ThisModule
    }
}

mergeObject(globalThis, { wor })
