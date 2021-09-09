/**
 * @file
 * This module augments ‘foundry-vtt-types’ with additional definitions.
 */

declare namespace Hooks
{
    export interface StaticCallbacks
    {
        closeTokenConfig: Hooks.CloseApplication<TokenConfig>
        deleteActiveEffect(effect: ActiveEffect, _: unknown, userId: string): void
        renderSettings: Hooks.RenderApplication<Settings>
        renderTokenConfig: Hooks.RenderApplication<TokenConfig>
        updateActiveEffect(effect: ActiveEffect, change: unknown, options: unknown, userId: string): void
        updateActor(_: unknown, update: object): void
        updateToken(_: unknown, __: unknown, update: object): void
        updateSetting(setting: Setting): void
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
