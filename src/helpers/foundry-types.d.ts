/**
 * @file
 * This module augments ‘foundry-vtt-types’ with additional definitions.
 */

declare namespace Hooks
{
    export interface StaticCallbacks
    {
        closeTokenConfig: Hooks.CloseApplication<TokenConfig>
        deleteActiveEffect: Hooks.DeleteEmbeddedEntity<ActiveEffectData>
        preCreateActiveEffect: Hooks.PreCreateEmbeddedEntity<ActiveEffectData>
        renderTokenConfig: Hooks.RenderApplication<object, TokenConfig>
        updateActiveEffect: Hooks.UpdateEmbeddedEntity<Entity, Actor>
        updateActor: Hooks.UpdateEntity<Actor.Data>
        // @ts-expect-error
        updateToken: Hooks.UpdateEmbeddedEntity<Token.Data, Scene>
    }
}

declare interface Token
{
    icon?: PIXI.Sprite
}

declare interface LenientGlobalVariableTypes
{
    game: true
}

declare type Combatant = Combat.Combatant
