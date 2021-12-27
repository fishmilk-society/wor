import StatusEffect from '../effects/StatusEffect'

declare global
{
    interface DocumentClassConfig
    {
        ActiveEffect: typeof StatusEffect
    }
}

export { }
