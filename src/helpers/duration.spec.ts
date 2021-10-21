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

    describe('.toString', () =>
    {
        const theStringFor = (s: number) => Duration.fromSeconds(s).toString()

        it('knows many units', () =>
        {
            theStringFor(86_400).should.contain('day')
            theStringFor(3_600).should.contain('hour')
            theStringFor(60).should.contain('minute')
            theStringFor(6).should.contain('round')
            theStringFor(1).should.contain('second')
        })

        it('pluralizes correctly', () =>
        {
            theStringFor(6).should.equal('1 round')
            theStringFor(12).should.equal('2 rounds')
        })

        it('can combine units', () =>
        {
            theStringFor(72).should.equal('1 minute and 2 rounds')
            theStringFor(75).should.equal('1 minute, 2 rounds, and 3 seconds')
        })
    })

    describe('.parse', () =>
    {
        const theNumberOfSecondsIn = (s: string) => Duration.parse(s).toSeconds()
        const theCanonFormOf = (s: string) => Duration.parse(s).toString()

        it('knows many units', () =>
        {
            theNumberOfSecondsIn('1 day').should.equal(86_400)
            theNumberOfSecondsIn('1 hour').should.equal(3_600)
            theNumberOfSecondsIn('1 minute').should.equal(60)
            theNumberOfSecondsIn('1 round').should.equal(6)
            theNumberOfSecondsIn('1 second').should.equal(1)
        })

        it('handles abbreviations', () =>
        {
            theCanonFormOf('1 min').should.equal('1 minute')
            theCanonFormOf('1 min.').should.equal('1 minute')
            theCanonFormOf('2 mins').should.equal('2 minutes')
            theCanonFormOf('2 mins.').should.equal('2 minutes')
        })

        it('can parse combined units', () =>
        {
            theNumberOfSecondsIn('1 minute and 2 rounds').should.equal(72)
            theNumberOfSecondsIn('1 minute, 2 rounds, and 3 seconds').should.equal(75)
            theNumberOfSecondsIn('1 minute plus 5 rounds').should.equal(90)
        })
    })
})
