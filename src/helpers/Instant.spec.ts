import { expect } from 'chai'
import '../spec'
import Instant from './Instant'

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

    describe('.addSeconds', function()
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

            firstRound.compareTo(secondRound).should.eq(BEFORE)
            secondRound.compareTo(secondRound).should.eq(0)
            secondRound.compareTo(firstRound).should.eq(AFTER)
        })

        it('takes initiative into account', function()
        {
            const firstTurn = new Instant(0, 20)
            const secondTurn = new Instant(0, 15)

            firstTurn.compareTo(secondTurn).should.eq(BEFORE)
            secondTurn.compareTo(secondTurn).should.eq(0)
            secondTurn.compareTo(firstTurn).should.eq(AFTER)
        })

        it('compares the clock first', function()
        {
            const firstTurnOnSecondRound = new Instant(6, 20)
            const secondTurnOnFirstRound = new Instant(0, 15)

            secondTurnOnFirstRound.compareTo(firstTurnOnSecondRound).should.eq(BEFORE)
            firstTurnOnSecondRound.compareTo(firstTurnOnSecondRound).should.eq(0)
            firstTurnOnSecondRound.compareTo(secondTurnOnFirstRound).should.eq(AFTER)
        })

        it('considers clock-only instants to occur first', function()
        {
            const secondRound = new Instant(6)
            const firstTurnOnSecondRound = new Instant(6, 20)

            secondRound.compareTo(firstTurnOnSecondRound).should.eq(BEFORE)
            firstTurnOnSecondRound.compareTo(firstTurnOnSecondRound).should.eq(0)
            firstTurnOnSecondRound.compareTo(secondRound).should.eq(AFTER)
        })
    })
})
