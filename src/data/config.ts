import { CharacterSourceData } from "./CharacterSourceData"

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
