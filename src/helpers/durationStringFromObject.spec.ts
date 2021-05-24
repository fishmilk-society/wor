import "../spec"

import { mockable } from './durationStringFromObject'

describe('durationStringFromObject', () =>
{
    const durationStringFromObject = mockable.bind(null, {
        durationStringFromSeconds(seconds) { return seconds + "s" },
        worldTime() { return 12 },
    })

    it('does stuff', () =>
    {
        durationStringFromObject({
            duration: {
                startTime: 12,
                seconds: 12,
            },
            flags: {}
        }).should.equal('12s')

        durationStringFromObject({
            duration: {
                startTime: 6,
                seconds: 12,
            },
            flags: {}
        }).should.equal('6s')

        durationStringFromObject({
            duration: {
                startTime: 6,
                seconds: 6,
            },
            flags: {}
        }).should.equal('0s')
    })
})
