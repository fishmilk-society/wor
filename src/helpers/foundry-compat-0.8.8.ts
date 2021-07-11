import { CharacterData } from "../entities/actor"
import { unwrap } from "./assertions"

declare global
{
    namespace Hooks
    {
        export interface StaticCallbacks
        {
            deleteActiveEffect(_: unknown, data: object, userId: string): void
            renderTokenConfig: Hooks.RenderApplication<TokenConfig>
            updateActiveEffect(effect: ActiveEffect, change: unknown, options: unknown, userId: string): void
            updateActor(_: unknown, update: object): void
            updateToken(_: unknown, __: unknown, update: object): void
        }
    }

    type CharacterDataSourceData = CharacterData
    type CharacterDataSource = { type: 'character', data: CharacterDataSourceData }
    type ActorDataSource = CharacterDataSource
    interface SourceConfig
    {
        Actor: ActorDataSource
    }
    interface DataConfig
    {
        Actor: ActorDataSource
    }

    interface LenientGlobalVariableTypes
    {
        game: true
    }
}

export namespace FoundryCompat
{
    export async function createActiveEffect(data: DeepPartial<ActiveEffect['data']>, actor: Actor): Promise<ActiveEffect>
    {
        const createdEffect = await actor.createEmbeddedDocuments("ActiveEffect", [data])
        const id = unwrap(createdEffect[0].id)
        const effect = actor.effects.get(id)
        return unwrap(effect)
    }

    export function deleteChatMessage(id: string): void
    {
        ChatMessage.deleteDocuments([id])
    }

    export function getTokenFromConfig(config: TokenConfig): Token | undefined
    {
        return (config.token as any)._object
    }

    export function getUsers(entity: Actor | Item, role: keyof typeof foundry.CONST.ENTITY_PERMISSIONS): Array<User>
    {
        const owners = Array<User>()
        for (const user of game.users!)
        {
            if (entity.testUserPermission(user, role, {}))
                owners.push(user)
        }
        return owners
    }

    export namespace updateActiveEffect
    {
        type Args = Parameters<Hooks.StaticCallbacks['updateActiveEffect']>

        export function getEffect([effect]: Args): ActiveEffect
        {
            return effect
        }

        export function getUserId([, , , userId]: Args): string
        {
            return userId
        }
    }

    export namespace deleteActiveEffect
    {
        type Args = Parameters<Hooks.StaticCallbacks['deleteActiveEffect']>

        export function getChange([, change]: Args): object
        {
            return change
        }

        export function getUserId([, , userId]: Args): string
        {
            return userId
        }
    }
}
