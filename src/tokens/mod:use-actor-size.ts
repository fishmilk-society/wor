import { SizeCategory } from "../entities/actor"
import { expect } from "../helpers/assertions"

const MINIMUM_VISIBLE_AURA = 0.0001

const SPACE: Record<SizeCategory, number> = {
    'fine': 0.5,
    'diminutive': 1,
    'tiny': 2.5,
    'small': 5,
    'medium': 5,
    'large': 10,
    'huge': 15,
    'gargantuan': 20,
    'colossal': 30,
}

Hooks.on('updateActor', async function(actor: Actor, update: DeepPartial<Actor['data']>, options: object, userId: string)
{
    if (userId != game.userId)
        return

    if (!update.data?.attributes?.size)
        return

    const actorToEdit = actor.id

    expect(ui.notifications)
    expect(game.scenes)

    ONTO_THE_NEXT_SCENE:
    for (const scene of game.scenes)
    {
        const updates = new Array<TokenUpdate>()

        for (const token of scene.tokens)
        {
            if (token.data.actorId != actorToEdit)
                continue

            const update = getUpdatesFor(token)

            if (!update)
            {
                continue
            }
            if (update instanceof Error)
            {
                ui.notifications.warn(update.message)
                continue ONTO_THE_NEXT_SCENE
            }

            updates.push(update)
        }

        await scene.updateEmbeddedDocuments('Token', updates as Array<any>)
    }
})

function getUpdatesFor(token: TokenDocument): TokenUpdate | Error | undefined
{
    if (!token.actor)
        return

    expect(token.id)
    expect(token.parent)

    const { category, reach } = token.actor.data.data.attributes.size
    const { gridType, gridDistance, gridUnits, grid } = token.parent.data

    if (gridUnits != 'ft')
        return new Error(`Only scenes with ‘ft’ as the grid unit are supported.`)

    if (gridType >= 2)
        return new Error(`Only gridless/square-gridded scenes are supported.`)

    const result: TokenUpdate = { _id: token.id }

    let logicalSize = SPACE[category] / gridDistance
    logicalSize = Math.ceil(logicalSize * 2) / 2

    const dx = (token.data.width - logicalSize) * grid / 2
    const dy = (token.data.height - logicalSize) * grid / 2

    result.x = token.data.x + dx
    result.y = token.data.y + dy
    result.width = logicalSize
    result.height = logicalSize

    let visibleSize = 0
    if (gridType == CONST.GRID_TYPES.GRIDLESS)
        visibleSize = gridDistance / 2
    result['flags.token-auras.aura2.distance'] = Math.max(visibleSize, MINIMUM_VISIBLE_AURA)

    const visibleReach = Math.max(reach - 4, 0.1)
    result['flags.token-auras.aura1.distance'] = Math.max(visibleSize + visibleReach, MINIMUM_VISIBLE_AURA)

    return result
}

interface TokenUpdate
{
    _id: string
    x?: number
    y?: number
    width?: number
    height?: number
    'flags.token-auras.aura1.distance'?: number
    'flags.token-auras.aura2.distance'?: number
}
