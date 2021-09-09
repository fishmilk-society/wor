import { unwrap } from "../helpers/assertions"
import { UpdateActorMessage } from '../../foundrymq/messages/UpdateActorMessage'
import { MessageQueue } from "./lib:MessageQueue"

async function processMessage(message: UpdateActorMessage): Promise<void>
{
    const actorToModify = unwrap(game.actors).get(message.actorId)
    if (!actorToModify)
        throw new Error(`Unknown actor ${message.actorId}`)

    await actorToModify.update({
        data: {
            hp: message.attributes?.hp,
            heroLab: {
                lastUpdate: new Date().toISOString(),
                fileName: message.source?.file,
                characterName: message.source?.character,
            }
        }
    })
}

Hooks.once('ready', function()
{
    if (unwrap(game.user).isGM)
        MessageQueue.on(`UpdateActor:v1:${game.world.id}`, processMessage)
})
