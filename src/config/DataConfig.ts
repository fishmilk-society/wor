import { CharacterData } from "../data/CharacterData"

declare global
{
    interface DataConfig
    {
        Actor: { type: 'character', data: CharacterData }
    }
}

export { }
