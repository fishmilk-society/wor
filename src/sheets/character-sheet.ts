// import { getRemaining } from '../helpers/durations'
import './character-sheet.sass'

export class CharacterSheet extends ActorSheet<CharacterSheet.Data>
{
    private _hookId = 0

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

        if (!this._hookId)
        {
            const fn = this.onTimeChanged.bind(this)
            this._hookId = Hooks.on('updateWorldTime', fn)
        }

        html.on('click', '[data-action^=wor-]', evt =>
        {
            this.handleAction(evt.currentTarget.dataset)
        })
    }

    close(options?: FormApplication.CloseOptions)
    {
        if (this._hookId)
        {
            Hooks.off('updateWorldTime', this._hookId)
            this._hookId = 0
        }

        return super.close(options)
    }

    onTimeChanged()
    {
        this.render()
    }

    async getData(options?: Application.RenderOptions)
    {
        const data = await super.getData(options)

        for (const effect of data.actor.effects)
        {
            effect.remaining = '123'//getRemaining(effect.duration)
        }

        return data
    }

    private handleAction(dataset: DOMStringMap)
    {
        const actor = this.actor

        switch (dataset.action)
        {
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

export namespace CharacterSheet
{
    export interface Data extends ActorSheet.Data
    {
        actor: ActorSheet.Data['actor'] & {
            effects: Array<{
                remaining?: string
            }>
        }
    }
}

async function handleAddEffect(parent: Actor | Item)
{
    const createdEffect = await ActiveEffect.create({
        label: 'New effect',
        icon: 'icons/svg/aura.svg',
    }, parent).create()

    const collection: Collection<ActiveEffect> = parent.effects
    const effect = collection.get(createdEffect._id)
    if (!effect)
        throw 'Could not find created effect'

    effect.sheet.render(true)
}
