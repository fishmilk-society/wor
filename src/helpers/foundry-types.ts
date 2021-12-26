/**
 * @file
 * This module augments ‘foundry-vtt-types’ with additional definitions.
 */

import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs"
import StatusEffect from "../effects/StatusEffect"

declare global
{
    namespace Hooks
    {
        export interface StaticCallbacks
        {
            closeTokenConfig: Hooks.CloseApplication<TokenConfig>
            deleteActiveEffect(effect: StatusEffect, _: unknown, userId: string): void
            renderSettings: Hooks.RenderApplication<Settings>
            renderTokenConfig: Hooks.RenderApplication<TokenConfig>
            updateActiveEffect(effect: StatusEffect, change: unknown, options: unknown, userId: string): void
            updateActor(actor: Actor, change: DeepPartial<Actor['data']>, options: DocumentModificationOptions, userId: string): void
            updateScene(scene: Scene, change: DeepPartial<Scene['data']>, options: DocumentModificationOptions, userId: string): void
            updateCombat: UpdateDocument<typeof Combat>
            updateSetting: UpdateDocument<typeof Setting>
            updateToken(_: unknown, __: unknown, update: object): void
        }
    }

    interface LenientGlobalVariableTypes
    {
        game: true
    }

    interface Token
    {
        icon?: PIXI.Sprite
    }
}
