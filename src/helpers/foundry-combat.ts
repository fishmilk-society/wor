import { ensure } from "./assertions"

export namespace FoundryCompat
{
    export function getTokenFromConfig(config: TokenConfig): Token | undefined
    {
        return config.token
    }

    export namespace updateActiveEffect
    {
        type Args = Parameters<Hooks.StaticCallbacks['updateActiveEffect']>

        export function getEffect([parent, change]: Args): ActiveEffect
        {
            const result = parent.effects.get(change.id)
            ensure(result)
            return result
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
