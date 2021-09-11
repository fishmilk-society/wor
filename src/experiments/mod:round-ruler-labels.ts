import { expect, unwrap } from "../helpers/assertions"

Hooks.once('dragRuler.ready', function()
{
    expect(canvas?.controls?.ruler)

    function replace(this: Ruler)
    {
        this._getSegmentLabel = function(this: Ruler, segmentDistance, totalDistance, isTotal)
        {
            expect(canvas?.scene)

            const number = Math.ceil(totalDistance)
            const units = canvas.scene.data.gridUnits
            return `${number} ${units}`
        }
    }

    replace.call(canvas.controls.ruler)
})
