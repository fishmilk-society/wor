declare global
{
    interface FlagConfig
    {
        ActiveEffect: {
            wor?: {
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
