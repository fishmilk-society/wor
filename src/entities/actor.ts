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
    heroLabSync: {
        lastUpdate: number
        file: string
        character: string
    }
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
