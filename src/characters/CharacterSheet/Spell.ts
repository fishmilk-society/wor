import Duration from '../../helpers/duration'

export namespace Spell
{
    export function calculateDuration(spell: Item, params: { cl: number; extended: boolean, targets: number }): Duration
    {
        const { duration: d } = spell.data.data.statusEffect

        let { seconds } = d

        if (params.extended)
            seconds *= 2

        if (d.perLevel)
            seconds *= params.cl

        if (d.split)
        {
            seconds /= params.targets
            seconds = ~~(seconds / 6) * 6
        }

        return Duration.fromSeconds(seconds)
    }
}
