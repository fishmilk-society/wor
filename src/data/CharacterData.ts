import { SizeCategory } from './SizeCategory'

export interface CharacterData
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

export namespace CharacterData
{
    export const TEMPLATE: CharacterData = {
        attributes: {
            hp: {
                value: 0,
                max: 0
            },
            init: 0,
            size: {
                category: SizeCategory.medium,
                reach: 5
            },
            speed: {
                base: 30
            }
        },
        heroLabSync: {
            lastUpdate: 0,
            file: '',
            character: ''
        }
    }
}
