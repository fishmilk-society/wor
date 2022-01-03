import { SizeCategory } from '../../data/SizeCategory'
import { expect, unwrap } from '../../helpers/assertions'
import { formatDate } from '../../helpers/format-date'
import { Uniquity } from '../../helpers/uniquity'
import './styles.sass'
import template from './template.hbs'
import { CharacterSheetData, EffectInfo, HeroLabSyncInfo } from './models'
import StatusEffect from '../../effects/StatusEffect'
import { renderPartial } from '../../helpers/renderPartial'
import { DragDropHelpers } from './DragDropHelpers'
import { ReceiveSpellDialog } from '../../spells/ReceiveSpellDialog'

export class CharacterSheet extends ActorSheet
{
    static override get defaultOptions(): ActorSheet.Options
    {
        return {
            ...super.defaultOptions,
            dragDrop: [{ dropSelector: '[data-drop-target]' }],
            height: 'auto',
            resizable: false,
            template,
            width: 400,
        }
    }

    override activateListeners(html: JQuery)
    {
        super.activateListeners(html)

        DragDropHelpers.fixCursorIn(this)

        html.on('click', '[data-action^=wor-]', evt =>
        {
            this.handleAction(evt.currentTarget.dataset)
        })
    }

    protected override _onDragOver(event: DragEvent): void
    {
        DragDropHelpers.highlight(event)
    }

    get #tokenDocument(): TokenDocument | undefined
    {
        if (!this.token)
            return undefined

        return this.token
    }

    protected override async _onDropItem(event: DragEvent, data: ActorSheet.DropData.Item): Promise<unknown>
    {
        const dropTarget = DragDropHelpers.getDropTarget(event)

        switch (dropTarget)
        {
            case 'effects':
                const spell = unwrap(await Item.fromDropData(data))
                return new ReceiveSpellDialog({
                    spell,
                    targets: [this.actor],
                }).render(true)

            default:
                throw new Error(`Unhandled case: ${dropTarget}`)
        }
    }

    protected override _onDropActiveEffect(event: DragEvent): Promise<unknown>
    {
        return DragDropHelpers.unsupported(event)
    }

    protected override _onDropActor(event: DragEvent): Promise<unknown>
    {
        return DragDropHelpers.unsupported(event)
    }

    protected override _onDropFolder(event: DragEvent): Promise<unknown>
    {
        return DragDropHelpers.unsupported(event)
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
        const sheet = this
        const actor = this.actor

        switch (dataset.action)
        {
            case 'wor-add-effect':
                return handleAddEffect()

            case 'wor-edit-effect':
                return showEditorFor(getClickedEffect())

            case 'wor-delete-effect':
                return getClickedEffect().delete()

            default:
                throw new Error(`Unhandled case: ${dataset.action}`)
        }

        async function handleAddEffect()
        {
            const created = await StatusEffect.create({
                label: 'New effect',
                icon: 'icons/svg/aura.svg',
            }, {
                parent: actor
            })
            showEditorFor(unwrap(created))
        }

        function getClickedEffect(): StatusEffect
        {
            const id = unwrap(dataset.id)
            const effect = unwrap(actor.effects.get(id))
            return effect
        }

        function showEditorFor(effect: StatusEffect)
        {
            effect.sheet.render(true, {
                top: unwrap(sheet.position.top) + 40,
                left: unwrap(sheet.position.left) + 10
            })
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
