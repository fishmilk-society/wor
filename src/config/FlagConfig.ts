import { ReceiveSpellCommandData, Serialized } from "../spells/ReceiveSpellCommand"

declare global
{
    interface FlagConfig
    {
        ActiveEffect: {
            wor?: {
                /** The effect’s caster level (if applicable). */
                cl?: number

                /** Whether the effect has been marked as ‘expired.’ */
                expired?: boolean

                /** The initiative position on which this effect procs. */
                initiative?: number
            }
        }

        ChatMessage: {
            wor?: {
                /**
                 * If set, then this chat message is an “effect has expired”
                 * notification for the specified status effect.
                 */
                associatedEffectId?: string

                /**
                 * If set, then this chat message represents a player’s request
                 * to add a status effect to one or more targets.
                 */
                request?: Serialized<ReceiveSpellCommandData>
            }
        }

        Token: {
            wor?: {
                /** Whether this token has low-light vision.*/
                lowLightVision?: boolean

                /** The anchor for this token’s image. */
                anchor?: { x: number; y: number }
            }
        }
    }
}

export { }
