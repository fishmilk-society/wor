import { CharacterSourceData, SizeCategory } from "../entities/actor"

/** TODO */
export interface CharacterSheetData extends ActorSheet.Data
{
    vm: {
        attributes: CharacterSourceData['attributes']
        effects: Array<EffectInfo>
        heroLabSync: HeroLabSyncInfo
        sizeCategories: Array<SizeCategory>
        uniquity?: string
        uniquityError?: string
    }
}

/** TODO */
export interface EffectInfo
{
    _id: string
    label: string
    icon?: string
    remaining: string
}

/**
 * Props related to the “Hero Lab Sync” section of the character sheet. The `lastUpdate`
 * variant is used for actors that have successfully synced. The `syncToken` variant is used
 * for actors that *could* potentially be synced. `undefined` is used for actors that cannot
 * be synced.
 */
export type HeroLabSyncInfo =
    { lastUpdate: string, file: string, character: string } |
    { syncToken: string } |
    undefined
