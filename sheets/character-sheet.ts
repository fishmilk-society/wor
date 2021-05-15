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
                return handleAddEffect(actor)

            case 'wor-edit-effect':
                return getEffectFromRow().sheet.render(true)

            case 'wor-delete-effect':
                return getEffectFromRow().delete()

            default:
                throw `Unknown action ‘${dataset.action}’`
        }

        function getEffectFromRow()
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

async function handleAddEffect(parent: Actor | Item)
{
    const createdEffect = await ActiveEffect.create({
        label: 'New effect',
        icon: 'icons/svg/aura.svg',
        duration: {
            startTime: game.time.worldTime,
        },
    }, parent).create()

    const collection: Collection<ActiveEffect> = parent.effects
    const effect = collection.get(createdEffect._id)
    if (!effect)
        throw 'Could not find created effect'

    effect.sheet.render(true)
}
