/**
 * @file
 * Hero Lab Sync will post an {@link UpdateActorMessage} to FoundryMQ whenever it detects a change.
 * This module polls for those messages and handles them.
 */

import { unwrap } from '../helpers/assertions'
import { UpdateActorMessage } from '../../foundrymq/messages/UpdateActorMessage'
import { MessageQueue } from './lib:MessageQueue'

/**
 * Enact an updates from Hero Lab Sync.
 */
async function processMessage(message: UpdateActorMessage): Promise<void>
{
    // Try to find the actor in question:
    const actorToModify = unwrap(game.actors).get(message.actorId)
    if (!actorToModify)
        throw new Error(`Unknown actor ${message.actorId}`)

    // Apply the update:
    await actorToModify.update({
        data: {
            hp: message.attributes?.hp,
            heroLabSync: {
                lastUpdate: Date.now(),
                file: message.source?.file,
                character: message.source?.character,
            }
        }
    })
}

/**
 * Once the game has loaded, connect to FoundryMQ.
 */
Hooks.once('ready', function()
{
    if (unwrap(game.user).isGM)
        MessageQueue.on(`UpdateActor:v1:${game.world.id}`, processMessage)
})
