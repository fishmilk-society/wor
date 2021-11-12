import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData'
import { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { expect, unwrap } from '../helpers/assertions'
import { getOwner } from '../helpers/get-owner'
import { StatusEffect } from './StatusEffect'

declare global
{
    interface FlagConfig
    {
        ChatMessage: {
            wor?: {
                /**
                 * If set, then this chat message is a “effect has expired”
                 * notification for the specified status effect.
                 */
                associatedEffectId?: string
            }
        }
    }
}

/**
 * A service which sends notifications (in the form of chat messages) whenever
 * status effects expire.
 */
export namespace StatusEffectNotifier
{
    /** Initializes {@link StatusEffectNotifier}. */
    export function init()
    {
        Hooks.on('updateActiveEffect', onEffectUpdated)
        Hooks.on('deleteActiveEffect', onEffectDeleted)
    }

    /** Called whenever a status effect is modified. */
    async function onEffectUpdated(effect: StatusEffect, change: DeepPartial<ActiveEffectData>, _: unknown, userId: string)
    {
        // Only run for the editor:
        if (userId != game.userId)
            return

        // Only run if the ‘expired’ flag has been set (or unset):
        const expired = getProperty(change, 'flags.wor.expired')
        if (expired === undefined)
            return

        // Sanity checks:
        expect(effect.parent)
        expect(effect.id)

        if (expired)
        {
            const player = getOwner(effect.parent)

            // Set up the notification data:
            const data: ChatMessageDataConstructorData = {
                speaker: { actor: effect.parent.id },
                content: `${effect.data.label} has expired.`,
                flags: { wor: { associatedEffectId: effect.id } },
            }

            // For PCs, allow the actor’s owner to delete this notification:
            if (player)
                data.user = player.id

            // For NPCs, make it a hidden notification:
            if (!player)
                data.whisper = [game.userId]

            await ChatMessage.create(data)
        }
        else
        {
            // The status effect was un-expired, so remove the notification:
            await deleteAssociatedMessages(effect.id)
        }
    }

    /** Called whenever a status effect is deleted. */
    function onEffectDeleted(effect: StatusEffect, _: unknown, userId: string)
    {
        // Only run for the deleter:
        if (userId != game.userId)
            return

        // The status effect no longer exists:
        return deleteAssociatedMessages(unwrap(effect.id))
    }

    /** Deletes any “effect has expired” notifications for the given status effect. */
    async function deleteAssociatedMessages(effectId: string)
    {
        // Sanity checks:
        expect(game.messages)

        // Find notifications:
        const messageIds = game.messages
            .filter(m => m.getFlag('wor', 'associatedEffectId') == effectId)
            .map(m => m.id)

        // Delete notifications (if any):
        await ChatMessage.deleteDocuments(messageIds)
    }
}
