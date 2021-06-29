/**
 * @file
 * This module augments ‘foundry-vtt-types’ with additional definitions.
 */

declare namespace Hooks
{
    export interface StaticCallbacks
    {
        // @ts-expect-error
        updateToken: Hooks.UpdateEmbeddedEntity<Token.Data, Scene>
    }
}

declare interface Token
{
    icon?: PIXI.Sprite
}
