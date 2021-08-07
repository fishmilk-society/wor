export interface CharacterSourceData
{
    hp: {
        value: number
        max: number
    }
    initiative: {
        final: number
    }
    speed: number
}

declare global
{
    interface SourceConfig
    {
        Actor: { type: 'character', data: CharacterSourceData }
    }

    interface DataConfig
    {
        Actor: { type: 'character', data: CharacterSourceData }
    }
}
