import { expect } from 'chai'
import '../spec'
import Instant from './Instant'

declare global
{
    interface LenientGlobalVariableTypes
    {
        game: true
    }
}

describe('Instant', function()
{
    describe('.clock', function()
    {
        it('matches the ctor value', function()
        {
            const actual = new Instant(6)
            actual.clock.should.equal(6)
        })
    })

    describe('.initiative', function()
    {
        it('matches the ctor value', function()
        {
            const actual = new Instant(0, 20)
            expect(actual.initiative).to.equal(20)
        })

        it('is undefined for clock-only instants', function()
        {
            const actual = new Instant(0)
            expect(actual.initiative).to.be.undefined
        })
    })

    describe('.addSeconds()', function()
    {
        it('works', function()
        {
            const subject = new Instant(12)
            const actual = subject.addSeconds(6)
            actual.clock.should.equal(18)
        })

        it('does not modify initiative', function()
        {
            const subject = new Instant(12, 20)
            const actual = subject.addSeconds(6)
            expect(actual.initiative).to.equal(20)
        })
    })

    describe('.compareTo()', function()
    {
        const BEFORE = -1
        const AFTER = +1

        it('takes the clock into account', function()
        {
            const firstRound = new Instant(0)
            const secondRound = new Instant(6)

            firstRound.compareTo(secondRound).should.equal(BEFORE)
            secondRound.compareTo(secondRound).should.equal(0)
            secondRound.compareTo(firstRound).should.equal(AFTER)
        })

        it('takes initiative into account', function()
        {
            const firstTurn = new Instant(0, 20)
            const secondTurn = new Instant(0, 15)

            firstTurn.compareTo(secondTurn).should.equal(BEFORE)
            secondTurn.compareTo(secondTurn).should.equal(0)
            secondTurn.compareTo(firstTurn).should.equal(AFTER)
        })

        it('compares the clock first', function()
        {
            const firstTurnOnSecondRound = new Instant(6, 20)
            const secondTurnOnFirstRound = new Instant(0, 15)

            secondTurnOnFirstRound.compareTo(firstTurnOnSecondRound).should.equal(BEFORE)
            firstTurnOnSecondRound.compareTo(firstTurnOnSecondRound).should.equal(0)
            firstTurnOnSecondRound.compareTo(secondTurnOnFirstRound).should.equal(AFTER)
        })

        it('considers clock-only instants to occur first', function()
        {
            const secondRound = new Instant(6)
            const firstTurnOnSecondRound = new Instant(6, 20)

            secondRound.compareTo(firstTurnOnSecondRound).should.equal(BEFORE)
            firstTurnOnSecondRound.compareTo(firstTurnOnSecondRound).should.equal(0)
            firstTurnOnSecondRound.compareTo(secondRound).should.equal(AFTER)
        })
    })

    describe('.relative()', function()
    {
        const opts = {
            now: new Instant(0, 20)
        }

        it('returns ‘past’ if it’s already happened', function()
        {
            const lastRound = new Instant(-6, 15)
            lastRound.toRelativeString(opts).should.equal('in the past')

            const lastTurn = new Instant(0, 25)
            lastTurn.toRelativeString(opts).should.equal('in the past')
        })

        it('returns a duration if it’s ≥1 round away', function()
        {
            const nextRoundSameInit = new Instant(6, 20)
            nextRoundSameInit.toRelativeString(opts).should.equal('1 round')

            const nextRoundLowerInit = new Instant(6, 15)
            nextRoundLowerInit.toRelativeString(opts).should.equal('1 round')
        })

        it('returns an initiative if it’s later this turn', function()
        {
            const nextTurn = new Instant(0, 15)
            nextTurn.toRelativeString(opts).should.equal('on initiative 15')
        })

        it('considers clock-only instants to occur first', function()
        {
            const thisRoundNoInit = new Instant(0)
            thisRoundNoInit.toRelativeString(opts).should.equal('in the past')
        })

        it('considers ‘now’ to have already passed', function()
        {
            const now = opts.now
            now.toRelativeString(opts).should.equal('in the past')
        })

        it('measures whole rounds', function()
        {
            const nextRoundButHigherInit = new Instant(6, 25)
            nextRoundButHigherInit.toRelativeString(opts).should.equal('on initiative 25')

            const thirdRoundAndHigherInit = new Instant(12, 25)
            thirdRoundAndHigherInit.toRelativeString(opts).should.equal('1 round')
        })

        it('handles clock-only instants that are <1 round away', function()
        {
            const nextRoundNoInit = new Instant(6)
            nextRoundNoInit.toRelativeString(opts).should.equal('at end of round')
        })
    })
})
