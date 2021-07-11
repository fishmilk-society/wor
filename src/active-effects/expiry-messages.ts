/**
 * @file
 * This module is used to manage the “effect has expired” message.
 */

import { expect, unwrap } from '../helpers/assertions'
import { FoundryCompat } from '../helpers/foundry-compat'
import MODULE from '../helpers/module-name'
const FLAG = 'expiryMessageId'

/**
 * Triggers the “effect has expired” message for this effect and sets a flag on the effect.
 */
export async function triggerExpiryFor(effect: ActiveEffect): Promise<void>
{
    expect(effect.parent)

    // Create the chat message:
    const newMessage = await ChatMessage.create({
        speaker: { actor: unwrap(effect.parent).id },
        content: `${effect.data.label} has expired.`,
        user: getOwner(effect)
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
        FoundryCompat.deleteChatMessage(id)

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
 * For effects on player-owned characters, this function returns the user ID of the owning player.
 */
function getOwner(effect: ActiveEffect): string | undefined
{
    // Find the actor for this effect:
    expect(effect.parent)

    // Get all player owners of that actor:
    const owners = FoundryCompat
        .getUsers(effect.parent, 'OWNER')
        .filter(u => !u.isGM)

    // No player owners:
    if (owners.length == 0)
        return undefined

    // Too many player owners:
    if (owners.length >= 2)
        ui.notifications?.error(`${effect.parent.name} has more than one owner.`)

    // Just right:
    return unwrap(owners[0].id)
}

/**
 * If an effect is deleted, we need to delete the dangling chat message.
 */
Hooks.on('deleteActiveEffect', function(...args)
{
    const data = FoundryCompat.deleteActiveEffect.getChange(args)
    const userId = FoundryCompat.deleteActiveEffect.getUserId(args)

    // Only run this hook for the user that made the change:
    if (userId != game.userId)
        return

    // If there’s an associated chat message, delete it:
    const id = getProperty(data, `flags.${MODULE}.${FLAG}`)
    if (typeof id == 'string')
        FoundryCompat.deleteChatMessage(id)
})
