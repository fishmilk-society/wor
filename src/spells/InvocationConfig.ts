import { InvocationData } from '../data/InvocationData'
import { fromUuidSafe } from '../helpers/fromUuidSafe'
import template from './InvocationConfig.hbs'

export class InvocationConfig extends ItemSheet
{
    static override get defaultOptions(): ItemSheet.Options
    {
        return {
            ...super.defaultOptions,
            closeOnSubmit: true,
            height: 'auto',
            resizable: false,
            submitOnChange: false,
            submitOnClose: false,
            template,
            width: 400,
        }
    }

    override async getData(options?: Partial<DocumentSheet.Options>): Promise<InvocationConfig.Data>
    {
        const data = await super.getData(options)

        const itemData = this.item.data.data as InvocationData

        const spell = await (async function(): Promise<Reference | null>
        {
            if (itemData.spell !== null)
            {
                const spell = await fromUuidSafe(itemData.spell, Item, 'spell')
                if (spell instanceof Error)
                    return { error: true, message: spell.message }
                else
                    return { error: false, name: spell.name!, img: spell.img! }
            }
            else
            {
                return null
            }
        })()

        return {
            ...data,
            vm: { spell },
        }
    }

    // override activateListeners(jQuery: JQuery): void
    // {
    //     super.activateListeners(jQuery)
    //     DurationEditors.initEditorsInForm(jQuery)
    // }

    static register()
    {
        Items.registerSheet('wor', this, {
            types: ['invocation'],
            makeDefault: true
        })
    }
}

type Reference =
    | { error: false, name: string, img: string }
    | { error: true, message: string }

namespace InvocationConfig
{
    export interface Data extends ItemSheet.Data
    {
        vm: {
            spell: Reference | null
        }
    }
}
