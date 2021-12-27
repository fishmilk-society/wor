export interface SpellData
{
    statusEffect: {
        duration: {
            seconds: number
            perLevel: boolean
        }
    }
}

export namespace SpellData
{
    export const TEMPLATE: SpellData = {
        statusEffect: {
            duration: {
                seconds: 60,
                perLevel: true
            }
        }
    }
}
