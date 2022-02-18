import StatusEffect from '../effects/StatusEffect'
import { unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'

export interface ReceiveSpellCommandData
{
    cl: number
    extended: boolean
    spell: Item
    targets: Array<Actor>
}

export class ReceiveSpellCommand
{
    #data: ReceiveSpellCommandData

    constructor(data: ReceiveSpellCommandData)
    {
        this.#data = deepClone(data)
    }

    get duration(): Duration
    {
        const d = this.#data
        return calculateDuration(d.spell, {
            cl: d.cl,
            extended: d.extended,
            targets: d.targets.length,
        })
    }

    async execute()
    {
        const seconds = this.duration.toSeconds()

        const effectData = {
            label: this.#data.spell.name,
            icon: this.#data.spell.img,
            duration: { seconds },
        }

        const promises = this.#data.targets.map(target =>
        {
            return StatusEffect.create(effectData, { parent: target })
        })

        await Promise.all(promises)

        await ChatMessage.create({
            content: this.#requestDescription,
            user: game.userId,
        })
    }

    get #requestDescription(): string
    {
        const targetNames = this.targetNames
        const d = this.#data
        return `${unwrap(game.user).name} added <i>${d.spell.name?.toLowerCase()}</i> to ${targetNames}.`
    }

    get targetNames(): string
    {
        return andify(this.#data.targets.map(t => t.name!))
    }
}

/** Joins a set of items in an English-friendly way. */
function andify(items: Array<string>): string
{
    if (items.length == 0)
        return ''
    else if (items.length == 1)
        return items[0]
    else if (items.length == 2)
        return items.join(' and ')

    else
        return items.slice(0, -1).join(', ') + ', and ' + items.at(-1)
}

function calculateDuration(spell: Item, params: { cl: number; extended: boolean, targets: number }): Duration
{
    // Get the spell’s duration info:
    const duration = spell.data.data.duration

    // Read the duration from the spell description:
    let seconds = duration.seconds
    if (duration.isPerLevel)
        seconds *= params.cl

    // Apply metamagic:
    if (params.extended)
        seconds *= 2

    // Split between recipients:
    if (duration.isSplit)
    {
        seconds /= params.targets
        seconds = ~~(seconds / 6) * 6
    }

    return Duration.fromSeconds(seconds)
}
