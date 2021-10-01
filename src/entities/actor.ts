/** A helper to generate an enumeration. */
function enumify<T extends string>(...values: Array<T>): Array<T>
{
    return values
}

const __sizeCategories = enumify(
    'fine',
    'diminutive',
    'tiny',
    'small',
    'medium',
    'large',
    'huge',
    'gargantuan',
    'colossal')

export type SizeCategory = typeof __sizeCategories[0]

export const SizeCategory = {
    get values(): Array<SizeCategory>
    {
        return __sizeCategories
    }
}

export interface CharacterSourceData
{
    attributes: {
        hp: {
            value: number
            max: number
        }
        init: number
        size: {
            category: SizeCategory
            reach: number
        }
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
