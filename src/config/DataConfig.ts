import { CharacterData } from '../data/CharacterData'
import { SpellData } from '../data/SpellData'

declare global
{
    interface DataConfig
    {
        Actor: { type: 'character', data: CharacterData }
        Item: { type: 'spell', data: SpellData }
    }
}

export { }
