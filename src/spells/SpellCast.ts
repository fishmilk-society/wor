import { expect, unwrap } from '../helpers/assertions'
import { requireElement } from '../helpers/require-element'
import { Uniquity } from '../helpers/uniquity'
import '../initiative/dialog.sass'
import { fromUuidSafe } from '../helpers/fromUuidSafe'
import template from './SpellDurationDialog.hbs'

interface InvocationUpdateData
{
    cl?: number | null
    spell?: Item | string | null
    targets?: Array<Actor | string>
}

interface CompleteArray<T> extends Array<T>
{
    asStrings(): Array<string>
}

function completeArrayBuilder<T extends string>()
{
    return {
        with<U extends T[]>(...array: U & ([T] extends [U[number]] ? unknown : never)): CompleteArray<T>
        {
            const result = array as any
            result.asStrings = function()
            {
                return this
            }
            return result
        }
    }
}

const UPDATE_KEYS = completeArrayBuilder<keyof InvocationUpdateData>()
    .with('cl', 'spell', 'targets')
    .asStrings()

interface InvocationData
{
    readonly cl: number | null
    readonly spell: string | null
    readonly targets: ReadonlyArray<string>
}

class InvocationDataImpl implements InvocationData
{
    #cl: number | null
    #spell: string | null
    #targets: Array<string>

    constructor()
    {
        this.#cl = null
        this.#spell = null
        this.#targets = []
    }

    get cl()
    {
        return this.#cl
    }
    set cl(value)
    {
        expect(value === null || (Number.isSafeInteger(value) && value >= 1))
        this.#cl = value
    }

    get spell()
    {
        return this.#spell
    }
    set spell(value)
    {
        expect(value === null || typeof value == 'string')
        this.#spell = value
    }

    get targets()
    {
        return [...this.#targets]
    }
    set targets(value)
    {
        expect(value instanceof Array)
        expect(value.every(t => typeof t == 'string'))
        this.#targets = [...value]
    }

    _update(data: InvocationUpdateData): void
    {
        expect(arguments.length == 1)
        expect(Object.keys(data).every(k => UPDATE_KEYS.includes(k)))
        mergeObject(this, data)
    }
}

class Invocation
{
    #data: InvocationDataImpl

    constructor()
    {
        this.#data = new InvocationDataImpl()
    }

    get data(): InvocationDataImpl
    {
        return this.#data
    }

    getSpell(): Promise<Item | Error | null>
    {
        if (this.#data.spell)
            return fromUuidSafe(this.#data.spell, Item, 'spell')
        else
            return Promise.resolve(null)
    }

    getTargets(): Promise<Array<Actor | Error>>
    {
        const promises = this.#data.targets.map(async id =>
        {
            return fromUuidSafe(id, Actor, 'character')
        })

        return Promise.all(promises)
    }

    setSpell(spell: Item | null): Promise<void>
    {
        return this.update({
            spell: spell && spell.uuid,
        })
    }

    update(data: InvocationUpdateData): Promise<void>
    {
        this.#data._update(data)
        return Promise.resolve()
    }
}

// export class Invocation
// {
//     private _cl: number | null = null
//     private _spell: Item | null = null
//     private _targets: Array<Actor> = []

//     static async fromObject(data: Invocation.Data): Promise<Invocation>
//     {
//         const result = new Invocation()
//         await result.update(data)
//         return result
//     }

//     get toObject(): Invocation.Data
//     {
//         return {
//             cl: this._cl,
//             spell: this._spell && this._spell.uuid,
//             targets: this._targets.map(t => t.uuid),
//         }
//     }

//     get cl(): number | null { return this._cl }
//     get spell(): Item | null { return this._spell }
//     get targets(): ReadonlyArray<Actor> { return this._targets }

//     async update({ cl, spell, targets }: Invocation.UpdateData): Promise<void>
//     {
//         if (cl !== undefined)
//         {
//             if (cl === null)
//             {
//                 this._cl = cl
//             }
//             else if (typeof cl == 'number')
//             {
//                 if (Number.isSafeInteger(cl) && cl >= 1)
//                     this._cl = cl
//                 else
//                     throw new RangeError('data.cl')
//             }
//             else
//             {
//                 throw new TypeError('data.cl')
//             }
//         }

//         if (spell !== undefined)
//         {
//             if (spell === null)
//             {
//                 this._spell = spell
//             }
//             else if (typeof spell == 'string')
//             {
//                 this._spell = await fromUuidSafe(spell, Item, 'spell')
//             }
//             else if (spell instanceof Item)
//             {
//                 if (spell.type == 'spell')
//                     this._spell = spell
//                 else
//                     throw new Error(`Item ‘${spell.uuid}’ is not a spell`)
//             }
//             else
//             {
//                 throw new TypeError('data.spell')
//             }
//         }

//         if (targets !== undefined)
//         {

//         }
//     }

//     private _setSpell(spell: Item): void
//     {
//         if (!(spell instanceof Item))
//             this._spell = spell
//     }

//     getCasterLevel(): number | undefined
//     {
//         return this._cl
//     }

//     setCasterLevel(cl: number | undefined): this
//     {
//         if (typeof cl == 'number')
//         {
//         }

//         this._cl = cl
//         return this
//     }

//     getSpell(): Item | undefined
//     {
//         return this.#data.spell
//     }

//     setSpell(spell: Item | undefined): this
//     {
//         this._spell = spell
//         return this
//     }

//     getTargets(): Array<Actor>
//     {
//         return [...this._targets]
//     }

//     setTargets(...targets: Array<Actor>): this
//     {
//         this._targets = [...targets]
//         return this
//     }

//     setTarget(target: Actor): this
//     {
//         this.setTargets(target)
//         return this
//     }

//     showDialog(): void
//     {
//         new SpellCastDialog(this).render(true)
//     }
// }

// export namespace Invocation
// {
//     export class Data
//     {
//         cl: number | null = null
//         spell: string | null = null
//         targets: Array<string>
//     }

//     export interface UpdateData
//     {
//         cl?: number | null
//         spell?: string | Item | null
//         targets?: Array<string> | Array<Actor>
//     }
// }

// class SpellCastDialog extends FormApplication<FormApplication.Options, { vm: SpellCastDialog.ViewModel }>
// {
//     #cast: Invocation

//     static override get defaultOptions(): FormApplication.Options
//     {
//         return {
//             ...super.defaultOptions,
//             classes: ['sheet'],
//             template,
//             title: 'Cast Spell',
//             width: 300
//         }
//     }

//     constructor(cast: Invocation)
//     {
//         super({})
//         this.#cast = cast
//     }

//     override getData()
//     {
//         return {
//             vm: {
//                 spell: this.#cast.getSpell() as any
//             }
//         }
//     }

//     override async _updateObject()
//     {
//     }

//     override activateListeners(html: JQuery): void
//     {
//         super.activateListeners(html)

//         const cl = requireElement(html, 'cl', HTMLInputElement)

//         // Allow the user to press escape to cancel the prompt:
//         cl.addEventListener('keydown', event =>
//         {
//             if (event.key == 'Escape')
//                 this.close()
//         })

//         // Ensure the field has initial focus:
//         cl.focus()
//     }
// }

// namespace SpellCastDialog
// {
//     export interface ViewModel
//     {
//         spell: {
//             name: string
//             img: string
//         }
//     }
// }
