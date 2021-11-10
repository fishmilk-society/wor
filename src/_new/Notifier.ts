import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData'
import { ActiveEffectData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs'
import { expect, unwrap } from '../helpers/assertions'
import { getOwner } from '../helpers/get-owner'
import { StatusEffect } from './StatusEffect'

export namespace Notifier
{
    export function init()
    {
        Hooks.on('updateActiveEffect', onEffectUpdated)
        Hooks.on('deleteActiveEffect', onEffectDeleted)
    }

    async function onEffectUpdated(effect: StatusEffect, change: DeepPartial<ActiveEffectData>, _: unknown, userId: string)
    {
        if (userId != game.userId)
            return

        const expired = getProperty(change, 'flags.wor.expired')
        if (expired === undefined)
            return

        if (expired)
        {
            expect(effect.parent)

            const data: ChatMessageDataConstructorData = {
                speaker: { actor: effect.parent.id },
                content: `${effect.data.label} has expired.`,
                flags: { wor: { associatedEffectId: unwrap(effect.id) } },
            }

            const player = getOwner(effect.parent)
            if (!player)
                data.whisper = [game.userId]
            else
                data.user = player.id

            await ChatMessage.create(data)
        }
        else
        {
            await deleteAssociatedMessages(unwrap(effect.id))
        }
    }

    function onEffectDeleted(effect: StatusEffect, _: unknown, userId: string)
    {
        if (userId != game.userId)
            return

        return deleteAssociatedMessages(unwrap(effect.id))
    }

    async function deleteAssociatedMessages(effectId: string)
    {
        const messageIds = unwrap(game.messages)
            .filter(m => m.getFlag('wor', 'associatedEffectId') == effectId)
            .map(m => m.id)

        await ChatMessage.deleteDocuments(messageIds)
    }
}
