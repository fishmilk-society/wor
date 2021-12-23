/**
 * @file
 * This module synchronizes size-related token properties with actor data. It works for both linked
 * and unlinked tokens.
 */

import { SizeCategory } from "../data/SizeCategory"
import { expect, unwrap } from "../helpers/assertions"
import { time } from "../helpers/time"

/** If an aura’s distance is set to 0, it will not render at all. */
const MINIMUM_RENDERABLE_AURA = 0.0001

/** How big a token of a given size category should be (in ft). */
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

// When an actor is updated, update all of its token:
Hooks.on('updateActor', async function(actor, change, _, userId)
{
    // Only for the user that triggered this change:
    if (userId != game.userId)
        return

    // Only if the actor’s size category or reach was changed:
    if (!change.data?.attributes?.size)
        return

    time('mod:use-actor-size.updateActor', async function()
    {
        for (const scene of unwrap(game.scenes))
            await updateTokensInScene(scene, unwrap(actor.id))
    })
})

// When a scene’s grid is updated, update all the tokens in that scene:
Hooks.on('updateScene', async function(scene, change, _, userId)
{
    // Only for the user that triggered this change:
    if (userId != game.userId)
        return

    // Only if the scene’s grid was changed:
    const gridChanged = Object.keys(change).some(k => k.startsWith('grid'))
    if (!gridChanged)
        return

    time('mod:use-actor-size.updateScene', () =>
    {
        return updateTokensInScene(scene)
    })
})

type MaybePromise = Promise<unknown> | void

/**
 * Updates the size and reach of tokens in the specified scene.
 * @param actorId If specified, only updates tokens pertaining to this actor.
 */
function updateTokensInScene(scene: Scene, actorId?: string): MaybePromise
{
    const batch = new Array<TokenUpdate>()

    for (const token of scene.tokens)
    {
        // If `actorId` was specified, only update that actor’s tokens:
        if (actorId && token.data.actorId != actorId)
            continue

        // Determine what should be updated for this token:
        const update = getUpdatesFor(token)

        // If an error was returned, print it and abort this function:
        if (update instanceof Error)
        {
            expect(ui.notifications)
            ui.notifications.warn(update.message)
            return
        }

        // If there were updates, add them to our batch:
        if (update)
            batch.push(update)
    }

    // Commit all the updates:
    return scene.updateEmbeddedDocuments('Token', batch as Array<any>)
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

function getUpdatesFor(token: TokenDocument): TokenUpdate | Error | undefined
{
    // Actorless tokens are ignored:
    if (!token.actor)
        return

    // ‘Prop’ tokens are ignored:
    if (token.getFlag('Border-Control', 'noBorder'))
        return

    const { category, reach } = token.actor.data.data.attributes.size
    const { gridUnits, gridType, gridDistance: feetPerSquare, grid: pixelsPerSquare } = unwrap(token.parent).data
    const { width: oldWidthInSquares, height: oldHeightInSquares } = token.data

    // Ensure the scene is compatible:
    if (gridUnits != 'ft')
        return new Error(`Only scenes with ‘ft’ as the grid unit are supported.`)
    if (gridType >= 2)
        return new Error(`Only gridless/square-gridded scenes are supported.`)

    const result: TokenUpdate = { _id: unwrap(token.id) }

    // Determine the size of this token:
    let sizeInSquares = getSizeInSquares(category, feetPerSquare)
    result.width = sizeInSquares
    result.height = sizeInSquares

    // If the token changed size, re-center it:
    const dx = (oldWidthInSquares - sizeInSquares) * pixelsPerSquare / 2
    const dy = (oldHeightInSquares - sizeInSquares) * pixelsPerSquare / 2
    result.x = token.data.x + ~~dx
    result.y = token.data.y + ~~dy

    // Determine the radius of the ‘base’ aura:
    let visibleSize = 0
    if (gridType == CONST.GRID_TYPES.GRIDLESS)
        visibleSize = feetPerSquare / 2
    result['flags.token-auras.aura2.distance'] = Math.max(visibleSize, MINIMUM_RENDERABLE_AURA)

    // Determine the radius of the ‘reach’ aura:
    const visibleReach = Math.max(reach - 4, 0.1)
    result['flags.token-auras.aura1.distance'] = Math.max(visibleSize + visibleReach, MINIMUM_RENDERABLE_AURA)

    return result
}

function getSizeInSquares(category: SizeCategory, squareSizeInFeet: number): number
{
    let sizeInSquares = SPACE[category] / squareSizeInFeet

    // Round UP to the nearest 0.5 squares (required by Foundry):
    sizeInSquares = Math.ceil(sizeInSquares * 2) / 2

    return sizeInSquares
}
