import { CharacterData } from './CharacterData'
import { SpellData } from './SpellData'

declare global
{
    interface SourceConfig
    {
        Actor: { type: 'character', data: CharacterData }
        Item: { type: 'spell', data: SpellData }
    }

    interface DataConfig extends SourceConfig
    {
    }
}
