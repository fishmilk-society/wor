/**
 * @file
 * This module is used to manage the “effect has expired” message.
 */

import { expect, unwrap } from '../helpers/assertions'
import { getOwner } from '../helpers/get-owner'
import MODULE from '../helpers/module-name'
const FLAG = 'expiryMessageId'

/**
 * Triggers the “effect has expired” message for this effect and sets a flag on the effect.
 */
export async function triggerExpiryFor(effect: ActiveEffect): Promise<void>
{
    expect(effect.parent)

    // If this effect belongs to a player, the message should as well:
    let owner = getOwner(effect.parent)?.id

    // Create the chat message:
    const newMessage = await ChatMessage.create({
        speaker: { actor: effect.parent.id },
        content: `${effect.data.label} has expired.`,
        user: owner
    })

    // Keep a reference to it on this effect:
    await effect.setFlag(MODULE, FLAG, unwrap(newMessage).id)
}

/**
 * Reverts the effects of @see triggerExpiryFor for this effect.
 */
export async function revertExpiryFor(effect: ActiveEffect): Promise<void>
{
    // Delete the associated chat message:
    const id = effect.getFlag(MODULE, FLAG)
    if (typeof id == 'string')
        ChatMessage.deleteDocuments([id])

    // Clear the flag:
    await effect.unsetFlag(MODULE, FLAG)
}

/**
 * Whether the “effect has expired” message was triggered for this effect.
 *
 * This method is used to determine whether an effect has expired. An expired effect no longer
 * affects actor properties or renders an icon, and having an actual flag on the effect object
 * is the best way to trigger a proper change cycle when (and only when) the effect expires.
 *
 * This method will continue to return true even if the message was manually deleted by the GM.
 * This is required so that effects don’t suddenly reactivate when the GM wants to clean up the
 * chat log. That’s why the method is called ‘hasTriggeredFor’ and not ‘isVisibleFor’.
 */
export function wasExpiryTriggeredFor(effect: ActiveEffect): boolean
{
    return !!effect.getFlag(MODULE, FLAG)
}

/**
 * If an effect is deleted, we need to delete the dangling chat message.
 */
Hooks.on('deleteActiveEffect', function({ data }, _, userId)
{
    // Only run this hook for the user that made the change:
    if (userId != game.userId)
        return

    // If there’s an associated chat message, delete it:
    const id = getProperty(data, `flags.${MODULE}.${FLAG}`)
    if (typeof id == 'string')
        ChatMessage.deleteDocuments([id])
})
