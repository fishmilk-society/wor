import { SizeCategory } from "../../data/SizeCategory"
import { expect, unwrap } from '../../helpers/assertions'
import { formatDate } from '../../helpers/format-date'
import { Uniquity } from '../../helpers/uniquity'
import './styles.sass'
import template from './template.hbs'
import { CharacterSheetData, EffectInfo, HeroLabSyncInfo } from './models'
import StatusEffect from '../../effects/StatusEffect'
import { renderPartial } from '../../helpers/renderPartial'

export class CharacterSheet extends ActorSheet
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

        return this.token
    }

    override getData(): CharacterSheetData
    {
        const context = super.getData()
        expect(!(context instanceof Promise))

        // Project this character’s effects:
        const effects = this.actor.effects.map(infoForEffect)

        // Figure out this token’s uniquity:
        const uniquity = Uniquity.of(this.actor, this.#tokenDocument)

        // Figure out what to render for the Hero Lab Sync section:
        let heroLabSync: HeroLabSyncInfo
        if (uniquity == 'unique')
        {
            const data = this.actor.data.data.heroLabSync
            if (data.lastUpdate)
            {
                heroLabSync = {
                    lastUpdate: formatDate(data.lastUpdate),
                    character: data.character,
                    file: data.file,
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
            ...context,
            vm: {
                attributes: context.data.data.attributes,
                effects,
                heroLabSync,
                sizeCategories: SizeCategory.values(),
                uniquity: typeof uniquity == 'string' ? uniquity : undefined,
                uniquityError: uniquity instanceof Error ? uniquity.message : undefined,
            }
        }

        function infoForEffect(effect: StatusEffect): EffectInfo
        {
            return {
                _id: unwrap(effect.data._id),
                label: effect.data.label,
                icon: effect.data.icon ?? undefined,
                remaining: effect.remaining,
            }
        }
    }

    /**
     * Updates just the ‘Status Effects’ section.
     */
    async renderEffectsSection()
    {
        await renderPartial(this, '.wor-effects')
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
                throw new Error(`Unhandled case: ${dataset.action}`)
        }

        async function handleAddEffect(): Promise<void>
        {
            const created = await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'New effect',
                icon: 'icons/svg/aura.svg',
            }])

            expect(created.length == 1)
            expect(created[0] instanceof ActiveEffect)

            created[0].sheet.render(true)
        }

        function getClickedEffect(): ActiveEffect
        {
            const id = unwrap(dataset.id)
            const effect = unwrap(actor.effects.get(id))
            return effect
        }
    }

    static register()
    {
        Actors.registerSheet('wor', this, {
            types: ['character'],
            makeDefault: true
        })
    }
}

// If the clock or initiative tracker changes, re-render any visible character sheets:
Hooks.on('momentChanged', function()
{
    for (const key in ui.windows)
    {
        const window = ui.windows[key]
        if (window instanceof CharacterSheet)
            window.renderEffectsSection()
    }
})
