import { expect } from "../helpers/assertions"

namespace wor.rendering.LowLightVision
{
    let lowLightVision = false

    export function init()
    {
        function useLowLightVision()
        {
            expect(canvas?.tokens)

            let any = false

            for (const token of canvas.tokens.placeables)
            {
                if (!token._isVisionSource())
                    continue

                if (token.name != 'Maragna')
                    return false

                any = true
            }

            return any
        }

        function patchPerceptionManager(this: PerceptionManager)
        {
            const original = this.schedule

            this.schedule = function(options)
            {
                expect(canvas?.tokens)

                var llv = useLowLightVision()
                if (llv != lowLightVision)
                {
                    lowLightVision = llv

                    options ??= {}
                    options.lighting ??= {}
                    options.lighting.initialize = true
                }

                original.call(this, options)
            }
        }

        patchPerceptionManager.call(canvas!.perception)

        function patchPointSource(this: PointSource)
        {
            const original = this.initialize

            this.initialize = function(data)
            {
                if (this.sourceType == 'light' && lowLightVision)
                {
                    data ??= {}

                    const dim = data.dim ?? 0
                    const bright = data.bright ?? 0

                    if (dim > bright)
                    {
                        data.dim = 2 * dim - bright
                        data.bright = dim
                    }
                }

                return original.call(this, data)
            }
        }
        patchPointSource.call(PointSource.prototype)
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
