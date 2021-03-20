export class CharacterSheet extends ActorSheet
{
    static get defaultOptions(): BaseEntitySheet.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/sheets/character-sheet.hbs',
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

        switch (dataset.action) {
            case 'wor-add-effect':
                return ActiveEffect.create({
                    label: "New effect",
                    icon: "icons/svg/aura.svg"
                }, actor).create()

            case 'wor-edit-effect':
                return effect().sheet.render(true)

            case 'wor-delete-effect':
                return effect().delete()

            default:
                throw `Unknown action ‘${dataset.action}’`
        }

        function effect()
        {
            if (!dataset.id)
                throw 'Missing ‘data-id’ attribute'

            const effect = actor.effects.get(dataset.id)
            if (!effect)
                throw `Could not find effect ‘${dataset.id}’`

            return effect
        }
    }
}
