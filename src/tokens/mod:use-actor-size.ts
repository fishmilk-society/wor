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

Hooks.on('updateActor', async function(actor, change, _, userId)
{
    if (userId != game.userId)
        return

    if (!change.data?.attributes?.size)
        return

    expect(actor.id)
    expect(game.scenes)

    const before = Date.now()

    for (const scene of game.scenes)
        await updateTokensInScene(scene, actor.id)

    const after = Date.now()
    console.log(`mod:use-actor-size.updateActor took ${(after - before) / 1000}s`)
})

Hooks.on('updateScene', async function(scene, change, _, userId)
{
    if (userId != game.userId)
        return

    const gridChanged = Object.keys(change).some(k => k.startsWith('grid'))
    if (!gridChanged)
        return

    const before = Date.now()

    await updateTokensInScene(scene)

    const after = Date.now()
    console.log(`mod:use-actor-size.updateScene took ${(after - before) / 1000}s`)
})

type MaybePromise = Promise<unknown> | void

function updateTokensInScene(scene: Scene, actorId?: string): MaybePromise
{
    const updates = new Array<TokenUpdate>()

    for (const token of scene.tokens)
    {
        if (actorId && token.data.actorId != actorId)
            continue

        const update = getUpdatesFor(token)
        if (!update)
            continue

        if (update instanceof Error)
        {
            expect(ui.notifications)
            ui.notifications.warn(update.message)
            return
        }

        updates.push(update)
    }

    return scene.updateEmbeddedDocuments('Token', updates as Array<any>)
}

function getUpdatesFor(token: TokenDocument): TokenUpdate | Error | undefined
{
    if (!token.actor)
        return

    if (token.getFlag('Border-Control', 'noBorder'))
        return

    expect(token.id)
    expect(token.parent)

    const { category, reach } = token.actor.data.data.attributes.size
    const { gridUnits, gridType, gridDistance: gridSizeInFeet, grid: gridSizeInPixels } = token.parent.data

    if (gridUnits != 'ft')
        return new Error(`Only scenes with ‘ft’ as the grid unit are supported.`)

    if (gridType >= 2)
        return new Error(`Only gridless/square-gridded scenes are supported.`)

    const result: TokenUpdate = { _id: token.id }

    let logicalSize = SPACE[category] / gridSizeInFeet
    logicalSize = Math.ceil(logicalSize * 2) / 2

    const dx = (token.data.width - logicalSize) * gridSizeInPixels / 2
    const dy = (token.data.height - logicalSize) * gridSizeInPixels / 2
    result.x = token.data.x + ~~dx
    result.y = token.data.y + ~~dy

    result.width = logicalSize
    result.height = logicalSize

    let visibleSize = 0
    if (gridType == CONST.GRID_TYPES.GRIDLESS)
        visibleSize = gridSizeInFeet / 2
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
