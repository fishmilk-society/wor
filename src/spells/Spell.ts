import Duration from '../helpers/duration'

export namespace Spell
{
    export function calculateDuration(spell: Item, params: { cl: number; extended: boolean, targets: number }): Duration
    {
        // Get the spell’s duration info:
        const { duration: se } = spell.data.data.statusEffect

        // Read the duration from the spell description:
        let seconds = se.seconds
        if (se.perLevel)
            seconds *= params.cl

        // Apply metamagic:
        if (params.extended)
            seconds *= 2

        // Split between recipients:
        if (se.split)
        {
            seconds /= params.targets
            seconds = ~~(seconds / 6) * 6
        }

        return Duration.fromSeconds(seconds)
    }
}
