import Duration from '../helpers/duration'

export namespace Spell
{
    export function calculateDuration(spell: Item, params: { cl: number; extended: boolean, targets: number }): Duration
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
}
