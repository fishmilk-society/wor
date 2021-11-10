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

    describe('.init', function()
    {
        it('matches the ctor value', function()
        {
            const actual = new Instant(0, 20)
            expect(actual.init).to.equal(20)
        })

        it('is undefined for clock-only instants', function()
        {
            const actual = new Instant(0)
            expect(actual.init).to.be.undefined
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
            expect(actual.init).to.equal(20)
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

    describe('.relativeTo()', function()
    {
        const now = new Instant(0, 20)

        it('takes the clock into account', function()
        {
            const expiry = new Instant(-6, 15)
            expiry.relativeTo(now).should.equal('passed')
        })

        it('takes initiative into account', function()
        {
            const expiry = new Instant(0, 21)
            expiry.relativeTo(now).should.equal('passed')
        })

        it('considers clock-only instants to occur first', function()
        {
            const expiry = new Instant(0)
            expiry.relativeTo(now).should.equal('passed')
        })

        it('considers ‘now’ to have already passed', function()
        {
            const expiry = new Instant(0, 20)
            expiry.relativeTo(now).should.equal('passed')
        })

        it('usually returns a duration', function()
        {
            const expiry = new Instant(6, 20)
            expiry.relativeTo(now).should.equal('1 round')
        })

        it('returns an initiative if it’s coming up in this round', function()
        {
            const expiry = new Instant(6, 15)
            expiry.relativeTo(now).should.equal('on initiative 15')
        })

        it('returns an initiative if it’s <1 round away', function()
        {
            const expiry = new Instant(6, 21)
            expiry.relativeTo(now).should.equal('on initiative 21')
        })
    })
})
