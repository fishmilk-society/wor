import 'mocha'
import 'chai'
import { durationStringFromObject, durationStringFromSeconds } from './durations'

describe('durationStringFromSeconds', () =>
{
    it('expects an integer', () =>
    {
        const act = () => durationStringFromSeconds(2.5)
        act.should.throw(TypeError)
    })

    it('expects no more than one argument', () =>
    {
        // @ts-expect-error
        const act = () => durationStringFromSeconds(1, 2)
        act.should.throw(SyntaxError)
    })

    it('knows many units', () =>
    {
        durationStringFromSeconds(86_400).should.contain('day')
        durationStringFromSeconds(3_600).should.contain('hour')
        durationStringFromSeconds(60).should.contain('minute')
        durationStringFromSeconds(6).should.contain('round')
        durationStringFromSeconds(1).should.contain('second')
    })

    it('rounds down', () =>
    {
        durationStringFromSeconds(59).should.match(/^9 round/)
    })

    it('pluralizes correctly', () =>
    {
        durationStringFromSeconds(6).should.equal('1 round')
        durationStringFromSeconds(12).should.equal('2 rounds')
    })

    it('handles zero', () =>
    {
        durationStringFromSeconds(0).should.equal('this round')
    })

    it('handles negative numbers', () =>
    {
        durationStringFromSeconds(-1).should.equal('expired')
    })
})

describe('durationStringFromObject', () =>
{
    before(() =>
    {
        // @ts-ignore
        global.game = {
            time: {
                worldTime: 55,
            }
        }
    })

    after(() =>
    {
        // @ts-ignore
        delete global.game
    })

    it('does stuff', () =>
    {
        durationStringFromObject({
            startTime: 50,
            seconds: 12,
        }).should.equal('asdasd')
    })
})
