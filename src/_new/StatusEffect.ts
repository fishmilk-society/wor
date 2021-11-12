import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData'
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData'
import { ActiveEffectData, ChatMessageData, TokenData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { expect, unreachable, unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'
import { getOwner } from '../helpers/get-owner'
import Semaphore from '../helpers/semaphor'
import { time } from '../helpers/time'
import { delay } from '../helpers/delay'
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

export function getWorldInitiative(): number | undefined
{
    if (!game.combat)
        return undefined

    if (game.combat.round == 0)
        return undefined

    return game.combat.combatant.initiative ?? undefined
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

function shouldBeExpired(effect: StatusEffect): boolean
{
    const expiry = calculateExpiryFor(effect)
    if (expiry instanceof Instant)
        return expiry.compareTo(Instant.now) <= 0
    if (expiry == Unknown)
        return false
    unreachable(expiry)
}

export class StatusEffect extends ActiveEffect
{
    refreshIsExpired(): MaybePromise
    {
        const oldValue = this.data.flags.wor?.expired
        const newValue = shouldBeExpired(this)
        if (oldValue != newValue)
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

        this.data.update({
            flags: { wor: { initiative: Instant.now.initiative } }
        })
    }

    /** A string representing how much time is left on this effect or when it expires. */
    get remaining(): string
    {
        const expiry = calculateExpiryFor(this)
        if (expiry == Unknown)
            return 'unknown'

        const relative = expiry.relative()
        if (relative == 'past')
            return 'expired'
        else
            return relative
    }
}
