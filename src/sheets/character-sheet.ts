import { CharacterData } from '../entities/actor'
import { ensure, unhandledCase } from '../helpers/assertions'
import './character-sheet.sass'

export class CharacterSheet extends ActorSheet
{
    static override get defaultOptions(): BaseEntitySheet.Options
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

    override async getData(options?: Application.RenderOptions): Promise<CharacterSheet.Data>
    {
        const data = await super.getData(options)

        const effects = this.actor.effects.map(function(effect): CharacterSheet.EffectData
        {
            return {
                ...effect.data,
                remaining: effect.duration.label,
            }
        })

        return {
            ...data,
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
            const createdEffect = await ActiveEffect.create({
                label: 'New effect',
                icon: 'icons/svg/aura.svg',
            }, actor).create()

            const effect = actor.effects.get(createdEffect._id)
            ensure(effect)

            effect.sheet.render(true)
        }

        function getClickedEffect(): ActiveEffect
        {
            ensure(dataset.id)

            const effect = actor.effects.get(dataset.id)
            ensure(effect)

            return effect
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

    export interface Data extends ActorSheet.Data
    {
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
