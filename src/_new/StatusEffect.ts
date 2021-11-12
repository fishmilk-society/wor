import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData'
import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData'
import { ActiveEffectData, ChatMessageData, TokenData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { expect, unwrap } from '../helpers/assertions'
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

const PARENT_DATA = Symbol()

declare module '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
{
    interface DocumentModificationOptions
    {
        [PARENT_DATA]?: DeepPartial<TokenData>
    }
}

export class Flop extends TokenDocument
{
    override async _preUpdate(
        data: DeepPartial<TokenData>,
        options: DocumentModificationOptions,
        user: User)
    {
        options[PARENT_DATA] = data
        await super._preUpdate(data, options, user)
        delete options[PARENT_DATA]
    }
}

export class StatusEffect extends ActiveEffect
{
    refreshIsExpired(): MaybePromise
    {
        const { expiry } = this

        const shouldBeExpired = (function(): boolean
        {
            if (expiry == Unknown)
                return false
            return expiry.compareTo(Instant.now) <= 0
        })()

        if (this.data.flags.wor?.expired != shouldBeExpired)
        {
            return this.update({
                'flags.wor.expired': shouldBeExpired,
                'disabled': shouldBeExpired
            })
        }
    }

    get expiry(): Instant | Unknown
    {
        const { startTime, seconds } = this.data.duration

        if (startTime !== null && seconds !== undefined)
        {
            const initiative = this.data.flags.wor?.initiative
            return new Instant(startTime, initiative).addSeconds(seconds)
        }

        return Unknown
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
        const { expiry } = this
        if (expiry == Unknown)
            return 'unknown'

        const relative = expiry.relative()
        if (relative == 'past')
            return 'expired'
        else
            return relative
    }
}
