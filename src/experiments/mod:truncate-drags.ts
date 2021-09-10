import { expect } from "../helpers/assertions"

// experiment 1: truncate drag.
// does not work with waypoints yet. or with anything like difficult terrain.

Hooks.once('dragRuler.ready', function()
{
    expect(canvas?.controls?.ruler)

    const flop = canvas.controls.ruler.measure

    canvas.controls.ruler.measure = function(d, o)
    {
        let bits = flop.call(this, d, o)

        const q = (this as any).dragRulerRanges
        const max = q[q.length - 1].range

        const cur = bits[0].ray.distance / 140 * 5

        if (cur > max)
        {
            const asd = bits[0].ray.project(max / cur)
            d.x = asd.x
            d.y = asd.y
            return flop.call(this, d, o)
        }

        return bits
    }
})
