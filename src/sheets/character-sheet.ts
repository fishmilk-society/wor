import { CharacterSourceData } from '../entities/actor'
import { unhandledCase, unwrap } from '../helpers/assertions'
import { formatDate } from '../helpers/format-date'
import './character-sheet.sass'

export class CharacterSheet extends ActorSheet<ActorSheet.Options, CharacterSheet.Data>
{
    static override get defaultOptions(): ActorSheet.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/sheets/character-sheet.hbs',
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

    override async getData(): Promise<CharacterSheet.Data>
    {
        // TODO: remove usages of ! in this function

        const effects = this.actor.effects.map(function(effect): CharacterSheet.EffectData
        {
            return {
                _id: effect.data._id!,
                label: effect.data.label,
                icon: effect.data.icon!,
                remaining: effect.duration.label,
            }
        })

        let isLinked: boolean
        if (this.actor.isToken)
            isLinked = false
        else if (!this.actor.data.token.actorLink)
            isLinked = false
        else
            isLinked = true

        const data = this.actor.data.data

        let heroLabSync: CharacterSheet.HeroLabSync | undefined
        if (isLinked && data.heroLabSync.lastUpdate)
        {
            heroLabSync = {
                lastUpdate: formatDate(data.heroLabSync.lastUpdate),
                character: data.heroLabSync.character,
                file: data.heroLabSync.file,
            }
        }
        else if (isLinked)
        {
            heroLabSync = {
                syncToken: `#foundry_${game.world.id}_${this.actor.id}`
            }
        }

        return {
            actor: {
                name: this.actor.name!,
                img: this.actor.img!,
                isLinked: isLinked,
            },
            heroLabSync,
            data: this.actor.data.data,
            effects,
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
        actor: {
            img: string
            name: string
            isLinked: boolean
        }
        heroLabSync: HeroLabSync
        data: CharacterSourceData
        effects: Array<EffectData>
    }

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
