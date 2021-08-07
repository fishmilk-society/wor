import { unwrap } from "./assertions"

/**
 * For player-owned entities, this function returns the owner. Otherwise, it returns `undefined`.
 */
export function getOwner(entity: Actor | Item): User | undefined
{
    let owner: User | undefined

    for (const user of unwrap(game.users))
    {
        // Exclude GMs:
        if (user.isGM)
            continue

        // Only include owners:
        if (!entity.testUserPermission(user, 'OWNER', {}))
            continue

        // If there’s more than one owner, this method ain’t gonna work:
        if (owner)
            throw new Error(`${entity.name} has more than one owner.`)

        // Save the owner, but continue looping in case we find another:
        owner = user
        continue
    }

    return owner
}
