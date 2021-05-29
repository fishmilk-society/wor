import './character-sheet.sass'

export class CharacterSheet extends ActorSheet
{
    static get defaultOptions(): BaseEntitySheet.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/sheets/character-sheet.hbs',
            width: 400,
            height: 'auto',
            resizable: false
        }
    }

    activateListeners(html: JQuery)
    {
        super.activateListeners(html)

        html.on('click', '[data-action^=wor-]', evt =>
        {
            this.handleAction(evt.currentTarget.dataset)
        })
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
                throw `Unknown action ‘${dataset.action}’`
        }

        async function handleAddEffect()
        {
            const createdEffect = await ActiveEffect.create({
                label: 'New effect',
                icon: 'icons/svg/aura.svg',
            }, actor).create()

            const effect = actor.effects.get(createdEffect._id)
            if (!effect)
                throw 'Could not find created effect'

            effect.sheet.render(true)
        }

        function getClickedEffect()
        {
            if (!dataset.id)
                throw 'Missing ‘data-id’ attribute'

            const effect = actor.effects.get(dataset.id)
            if (!effect)
                throw `Could not find clicked effect`

            return effect
        }
    }
}
