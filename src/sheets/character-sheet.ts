import { CharacterData } from '../entities/actor'
import { unhandledCase, unwrap } from '../helpers/assertions'
import { FoundryCompat } from '../helpers/foundry-compat'
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
        const effects = this.actor.effects.map(function(effect): CharacterSheet.EffectData
        {
            return {
                _id: effect.data._id!,
                label: effect.data.label,
                icon: effect.data.icon!,
                remaining: effect.duration.label,
            }
        })

        return {
            actor: {
                name: this.actor.name!,
                img: this.actor.img!,
            },
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
            const effect = await FoundryCompat.createActiveEffect({
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
        actor: { img: string, name: string },
        data: CharacterData,
        effects: Array<EffectData>
    }
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
