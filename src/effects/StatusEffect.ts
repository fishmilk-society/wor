import { unreachable } from '../helpers/assertions'
import Moment from '../helpers/Moment'

export const UnknownExpiry = Symbol()
export type UnknownExpiry = typeof UnknownExpiry

export default class StatusEffect extends ActiveEffect
{
    /** Calculates when this effect will expire. */
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

    override get name()
    {
        return this.data.label
    }

    override get isTemporary(): boolean
    {
        // This flag determines whether an icon is displayed on the token. We
        // always want to display an icon (for non-disabled effects).
        return true
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

    override async _preCreate(...args: Parameters<ActiveEffect['_preCreate']>)
    {
        await super._preCreate(...args)

        // Record the current initiative position:
        this.data.update({
            'flags.wor.initiative': Moment.now.initiative
        })
    }
}
