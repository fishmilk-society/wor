import { DocumentModificationOptions } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs'
import { ActiveEffectDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/activeEffectData'
import { unreachable } from '../helpers/assertions'
import Moment from '../helpers/Moment'

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

export const UnknownExpiry = Symbol()
export type UnknownExpiry = typeof UnknownExpiry

export class StatusEffect extends ActiveEffect
{
    get expiry(): Moment | UnknownExpiry
    {
        const { startTime, seconds } = this.data.duration
        if (startTime !== null && seconds !== undefined)
        {
            const initiative = this.data.flags.wor?.initiative
            return new Moment(startTime, initiative).addSeconds(seconds)
        }
        return UnknownExpiry
    }

    override get isTemporary(): boolean
    {
        return true
    }

    override async _preCreate(data: ActiveEffectDataConstructorData, options: DocumentModificationOptions, user: User): Promise<void>
    {
        await super._preCreate(data, options, user)

        const { initiative } = Moment.now

        this.data.update({
            flags: { wor: { initiative } }
        })
    }

    /** A string representing how much time is left on this effect or when it expires. */
    get remaining(): string
    {
        const expiry = this.expiry

        if (expiry instanceof Moment)
            return expiry.toRelativeString({ formats: { inThePast: 'expired' } })

        if (expiry === UnknownExpiry)
            return 'unknown'

        unreachable(expiry)
    }
}
