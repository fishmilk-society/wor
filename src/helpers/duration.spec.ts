import "../spec"

import Duration from './duration'

describe('Duration', () =>
{
    describe('.fromSeconds', () =>
    {
        it('works for integers', () =>
        {
            const act = () => Duration.fromSeconds(2)
            act.should.not.throw()
        })

        it('fails for non-integers', () =>
        {
            const act = () => Duration.fromSeconds(2.5)
            act.should.throw(TypeError)
        })

        it('fails for zero', () =>
        {
            const act = () => Duration.fromSeconds(0)
            act.should.throw(RangeError)
        })

        it('fails for negative numbers', () =>
        {
            const act = () => Duration.fromSeconds(-2)
            act.should.throw(RangeError)
        })
    })

    describe('.toStringLossy', () =>
    {
        const theStringFor = (s: number) => Duration.fromSeconds(s).toStringLossy()

        it('knows many units', () =>
        {
            theStringFor(86_400).should.contain('day')
            theStringFor(3_600).should.contain('hour')
            theStringFor(60).should.contain('minute')
            theStringFor(6).should.contain('round')
            theStringFor(1).should.contain('second')
        })

        it('rounds down', () =>
        {
            theStringFor(59).should.match(/^9 round/)
        })

        it('pluralizes correctly', () =>
        {
            theStringFor(6).should.equal('1 round')
            theStringFor(12).should.equal('2 rounds')
        })
    })

    describe('.toStringExact', () =>
    {
        const theStringFor = (s: number) => Duration.fromSeconds(s).toStringExact()

        it('can combine units', () =>
        {
            theStringFor(12).should.equal('2 rounds')
            theStringFor(3_612).should.equal('1 hour and 2 rounds')
            theStringFor(3_613).should.equal('1 hour, 2 rounds, and 1 second')
        })
    })
})
