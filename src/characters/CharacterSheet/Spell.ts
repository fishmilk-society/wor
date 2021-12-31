import Duration from '../../helpers/duration'

export namespace Spell
{
    export function calculateDuration(spell: Item, options: { cl: number; extended: boolean }): Duration
    {
        let { seconds, perLevel } = spell.data.data.statusEffect.duration

        if (perLevel)
            seconds *= options.cl

        if (options.extended)
            seconds *= 2

        return Duration.fromSeconds(seconds)
    }
}
