/**
 * @file
 * This module augments ‘foundry-vtt-types’ with additional definitions. Note that any type
 * definitions that differ between 0.7 and 0.8 were moved to {@link ./foundry-compat.ts}.
 */

declare namespace Hooks
{
    export interface StaticCallbacks
    {
        closeTokenConfig: Hooks.CloseApplication<TokenConfig>
        deleteActiveEffect(effect: ActiveEffect, _: unknown, userId: string): void
        renderTokenConfig: Hooks.RenderApplication<TokenConfig>
        updateActiveEffect(effect: ActiveEffect, change: unknown, options: unknown, userId: string): void
        updateActor(_: unknown, update: object): void
        updateToken(_: unknown, __: unknown, update: object): void
    }
}

declare interface LenientGlobalVariableTypes
{
    game: true
}

declare interface Token
{
    icon?: PIXI.Sprite
}
