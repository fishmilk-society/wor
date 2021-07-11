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
    }
}

declare interface Token
{
    icon?: PIXI.Sprite
}
