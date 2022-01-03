export interface SpellData
{
    duration: {
        seconds: number
        isPerLevel: boolean
        isSplit: boolean
    }
}

export namespace SpellData
{
    export const TEMPLATE: SpellData = {
        duration: {
            seconds: 60,
            isPerLevel: true,
            isSplit: false,
        },
    }
}
