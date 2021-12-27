import { CharacterData } from "./CharacterData"

declare global
{
    interface SourceConfig
    {
        Actor: { type: 'character', data: CharacterData }
    }

    interface DataConfig extends SourceConfig
    {
    }
}
