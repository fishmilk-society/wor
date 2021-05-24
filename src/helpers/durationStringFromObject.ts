import durationStringFromSeconds from './durationStringFromSeconds'

interface Deps
{
    durationStringFromSeconds(seconds: number): string
    worldTime(): number
}

interface EffectStruct
{
    duration: ActiveEffectDuration
    flags: ActiveEffectData["flags"]
}

function baseImpl(deps: Deps, effect: EffectStruct): string
{
    const duration = effect.duration

    if (duration.startTime !== undefined && duration.seconds !== undefined)
    {
        const remaining = duration.startTime + duration.seconds - deps.worldTime()
        return deps.durationStringFromSeconds(remaining)
    }

    throw 'not implemented'
}

const realImpl = baseImpl.bind(null, {
    durationStringFromSeconds,
    worldTime() { return game.time.worldTime },
})

export { realImpl as default, baseImpl as mockable }
