import { CharacterData } from '../data/CharacterData'
import { InvocationData } from '../data/InvocationData'
import { SpellData } from '../data/SpellData'

type ItemDataConfig =
    | { type: 'invocation', data: InvocationData }
    | { type: 'spell', data: SpellData }

declare global
{
    interface DataConfig
    {
        Actor: { type: 'character', data: CharacterData }
        Item: ItemDataConfig
    }
}

export { }
