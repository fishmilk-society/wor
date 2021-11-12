import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData'
import { unreachable } from '../helpers/assertions'
import Instant from '../helpers/Instant'

declare global
{
    interface DocumentClassConfig
    {
        ActiveEffect: typeof StatusEffect
    }

    interface FlagConfig
    {
        ActiveEffect: {
            wor?: {
                expired?: boolean
                initiative?: number
            }
        }
    }
}

const Unknown = Symbol()
type Unknown = typeof Unknown

function calculateExpiryFor(effect: StatusEffect): Instant | Unknown
{
    const { startTime, seconds } = effect.data.duration
    if (startTime !== null && seconds !== undefined)
    {
        const initiative = effect.data.flags.wor?.initiative
        return new Instant(startTime, initiative).addSeconds(seconds)
    }
    return Unknown
}

function shouldBeExpired(effect: StatusEffect, now: Instant): boolean
{
    const expiry = calculateExpiryFor(effect)

    if (expiry instanceof Instant)
        return expiry.compareTo(now) <= 0

    if (expiry === Unknown)
        return false

    unreachable(expiry)
}

export class StatusEffect extends ActiveEffect
{
    refreshIsExpired(now = Instant.now): MaybePromise
    {
        const oldValue = this.data.flags.wor?.expired
        const newValue = shouldBeExpired(this, now)
        if (oldValue !== newValue)
        {
            return this.update({
                'flags.wor.expired': newValue,
                'disabled': newValue
            })
        }
    }

    override get isTemporary(): boolean
    {
        return true
    }

    override async _preCreate(data: ActiveEffectDataConstructorData, options: DocumentModificationOptions, user: User): Promise<void>
    {
        await super._preCreate(data, options, user)

        const { initiative } = Instant.now

        this.data.update({
            flags: { wor: { initiative } }
        })
    }

    /** A string representing how much time is left on this effect or when it expires. */
    get remaining(): string
    {
        const expiry = calculateExpiryFor(this)

        if (expiry instanceof Instant)
            return expiry.toRelativeString({ formats: { inThePast: 'expired' } })

        if (expiry === Unknown)
            return 'unknown'

        unreachable(expiry)
    }
}
