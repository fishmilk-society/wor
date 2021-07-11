import { unwrap } from "./assertions"

declare global
{
    namespace Hooks
    {
        export interface StaticCallbacks
        {
            deleteActiveEffect: Hooks.DeleteEmbeddedEntity<ActiveEffectData>
            preCreateActiveEffect: Hooks.PreCreateEmbeddedEntity<ActiveEffectData>
            renderTokenConfig: Hooks.RenderApplication<object, TokenConfig>
            updateActiveEffect: Hooks.UpdateEmbeddedEntity<Entity, Actor>
            updateActor: Hooks.UpdateEntity<Actor.Data>
            updateToken(parent: Scene, entity: Token.Data, change: object, options: Entity.UpdateOptions, userId: string): unknown
        }
    }
}

export namespace FoundryCompat
{
    export async function createActiveEffect(data: DeepPartial<ActiveEffect.Data>, actor: Actor): Promise<ActiveEffect>
    {
        const createdEffect = await ActiveEffect.create(data, actor).create()
        const effect = actor.effects.get(createdEffect._id)
        return unwrap(effect)
    }

    export function deleteChatMessage(id: string): void
    {
        ChatMessage.delete(id)
    }

    export function getTokenFromConfig(config: TokenConfig): Token | undefined
    {
        return config.token
    }

    export function getUsers(entity: Entity, role: keyof typeof ENTITY_PERMISSIONS): Array<User>
    {
        return entity.getUsers(role)
    }

    export namespace updateActiveEffect
    {
        type Args = Parameters<Hooks.StaticCallbacks['updateActiveEffect']>

        export function getEffect([parent, change]: Args): ActiveEffect
        {
            const effect = parent.effects.get(change._id)
            return unwrap(effect)
        }

        export function getUserId([, , , , userId]: Args): string
        {
            return coerceUserId(userId)
        }
    }

    export namespace deleteActiveEffect
    {
        type Args = Parameters<Hooks.StaticCallbacks['deleteActiveEffect']>

        export function getChange([, change]: Args): ActiveEffect.Data
        {
            return change
        }

        export function getUserId([, , , userId]: Args): string
        {
            return coerceUserId(userId)
        }
    }

    function coerceUserId(userId: number): string
    {
        return userId as any
    }
}
