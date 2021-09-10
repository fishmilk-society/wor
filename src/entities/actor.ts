export interface CharacterSourceData
{
    attributes: {
        hp: {
            value: number
            max: number
        }
        init: number
        speed: {
            base: number
        }
    }
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
