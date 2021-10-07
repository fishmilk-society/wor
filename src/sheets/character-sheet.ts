import { CharacterSourceData, SizeCategory } from '../entities/actor'
import { unhandledCase, unwrap } from '../helpers/assertions'
import { formatDate } from '../helpers/format-date'
import { Uniquity } from '../helpers/uniquity'
import './character-sheet.sass'
import template from './character-sheet.hbs'

export class CharacterSheet extends ActorSheet<ActorSheet.Options, CharacterSheet.Data>
{
    static override get defaultOptions(): ActorSheet.Options
    {
        return {
            ...super.defaultOptions,
            template,
            width: 400,
            height: 'auto',
            resizable: false
        }
    }

    override activateListeners(html: JQuery)
    {
        super.activateListeners(html)

        html.on('click', '[data-action^=wor-]', evt =>
        {
            this.handleAction(evt.currentTarget.dataset)
        })
    }

    get #tokenDocument(): TokenDocument | undefined
    {
        if (!this.token)
            return undefined

        // @ts-expect-error
        return this.token
    }

    override async getData(): Promise<CharacterSheet.Data>
    {
        // TODO: remove usages of ! in this function
        // TODO: in major need of refactoring

        // Project this character’s effects:
        const effects = this.actor.effects.map(function(effect): CharacterSheet.EffectData
        {
            return {
                _id: effect.data._id!,
                label: effect.data.label,
                icon: effect.data.icon!,
                remaining: effect.duration.label,
            }
        })

        // Get this character’s source data:
        const data = this.actor.data.data

        // Figure out this token’s uniquity:
        const uniquity = Uniquity.of(this.actor, this.#tokenDocument)

        // Figure out what to render for the Hero Lab Sync section:
        let heroLabSync: CharacterSheet.HeroLabSync
        if (uniquity == 'unique')
        {
            if (data.heroLabSync.lastUpdate)
            {
                heroLabSync = {
                    lastUpdate: formatDate(data.heroLabSync.lastUpdate),
                    character: data.heroLabSync.character,
                    file: data.heroLabSync.file,
                }
            }
            else
            {
                heroLabSync = {
                    syncToken: `#foundry_${game.world.id}_${this.actor.id}`
                }
            }
        }

        // Return it all:
        return {
            actor: {
                name: this.actor.name!,
                img: this.actor.img!,
                uniquity: typeof uniquity == 'string' ? uniquity : undefined,
                uniquityError: uniquity instanceof Error ? uniquity.message : undefined,
            },
            heroLabSync,
            data,
            effects,
            sizeCategories: SizeCategory.values,
        }
    }

    private handleAction(dataset: DOMStringMap)
    {
        const actor = this.actor

        switch (dataset.action)
        {
            case 'wor-add-effect':
                return handleAddEffect()

            case 'wor-edit-effect':
                return getClickedEffect().sheet.render(true)

            case 'wor-delete-effect':
                return getClickedEffect().delete()

            default:
                unhandledCase(dataset.action)
        }

        async function handleAddEffect(): Promise<void>
        {
            const effect = await createActiveEffect({
                label: 'New effect',
                icon: 'icons/svg/aura.svg',
            }, actor)
            effect.sheet.render(true)
        }

        function getClickedEffect(): ActiveEffect
        {
            const id = unwrap(dataset.id)
            const effect = actor.effects.get(id)
            return unwrap(effect)
        }
    }
}

export module CharacterSheet
{
    export interface EffectData
    {
        _id: string
        label: string
        icon?: string
        remaining: string
    }

    export interface Data
    {
        actor: { img: string, name: string; uniquity?: string, uniquityError?: string }
        heroLabSync: HeroLabSync
        data: CharacterSourceData
        effects: Array<EffectData>
        sizeCategories: Array<SizeCategory>
    }

    /**
     * Props related to the “Hero Lab Sync” section of the character sheet. The `lastUpdate`
     * variant is used for actors that have successfully synced. The `syncToken` variant is used
     * for actors that *could* potentially be synced. `undefined` is used for actors that cannot
     * be synced.
     */
    export type HeroLabSync =
        { lastUpdate: string, file: string, character: string } |
        { syncToken: string } |
        undefined
}

Hooks.on('updateWorldTime', function()
{
    for (const key in ui.windows)
    {
        const window = ui.windows[key]
        if (window instanceof CharacterSheet)
            window.render()
    }
})

async function createActiveEffect(data: DeepPartial<ActiveEffect['data']>, actor: Actor): Promise<ActiveEffect>
{
    const createdEffect = await actor.createEmbeddedDocuments('ActiveEffect', [data])
    const id = unwrap(createdEffect[0].id)
    const effect = unwrap(actor.effects.get(id))
    return effect
}
