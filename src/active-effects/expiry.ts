import MODULE from "../helpers/module-name"

const FLAG = 'expiryMessageId'

namespace Expiry
{
    export async function triggerFor(effect: ActiveEffect): Promise<void>
    {
        const newMessage = await ChatMessage.create({
            speaker: { actor: effect.parent._id },
            content: `${effect.data.label} has expired.`
        })
        await effect.setFlag(MODULE, FLAG, newMessage!._id)
    }

    export async function undoFor(effect: ActiveEffect): Promise<void>
    {
        const id = effect.getFlag(MODULE, FLAG)
        if (typeof id == 'string')
            await ChatMessage.delete(id)
        await effect.unsetFlag(MODULE, FLAG)
    }

    export function hasTriggeredFor(effect: ActiveEffect): boolean
    {
        return !!effect.getFlag(MODULE, FLAG)
    }

    export async function cleanupFor(deletedEffectData: ActiveEffectData): Promise<void>
    {
        const id = getProperty(deletedEffectData, `flags.${MODULE}.${FLAG}`)
        if (typeof id == 'string')
            await ChatMessage.delete(id)
    }
}

export default Expiry
