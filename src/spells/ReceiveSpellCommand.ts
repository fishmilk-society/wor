import StatusEffect from '../effects/StatusEffect'
import { unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'

/** Data for {@link ReceiveSpellCommand}. */
export interface ReceiveSpellCommandData
{
    /** The caster level of the spell. */
    cl: number

    /** Whether the Extend Spell metamagic is being used. */
    extended: boolean

    /** Which spell to apply. */
    spell: Item

    /** Which targets to affect. */
    targets: Array<Actor>
}

/** A command that applies a spell (as a status effect) to one or more targets. */
export class ReceiveSpellCommand
{
    private data: ReceiveSpellCommandData

    public constructor(data: ReceiveSpellCommandData)
    {
        this.data = deepClone(data)
    }

    /** Applies the specified spell (as a status effect) to the specified targets. */
    public async enact()
    {
        // Determine data of created effects:
        const effectData = {
            label: this.data.spell.name,
            icon: this.data.spell.img,
            duration: {
                seconds: this.duration.toSeconds()
            },
        }

        // Create all the status effects:
        const promises = this.data.targets.map(target =>
        {
            return StatusEffect.create(effectData, { parent: target })
        })
        await Promise.all(promises)

        // Print a notification:
        await ChatMessage.create({
            content: this.requestDescription,
            user: game.userId,
        })
    }

    /** Calculates what the duration of the created status effects will be. */
    public get duration(): Duration
    {
        return calculateDuration(this.data.spell, {
            cl: this.data.cl,
            extended: this.data.extended,
            targets: this.data.targets.length,
        })
    }

    /** The notification text (once this command has been enacted). */
    public get requestDescription(): string
    {
        const spellName = this.data.spell.name?.toLowerCase()
        const targetNames = this.targetNames
        return `${unwrap(game.user).name} added <i>${spellName}</i> to ${targetNames}.`
    }

    /** A human-readable list of targets that this command will affect. */
    public get targetNames(): string
    {
        return andify(this.data.targets.map(t => t.name!))
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

/** Calculate a spell’s duration (given some context about how it will be cast). */
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
