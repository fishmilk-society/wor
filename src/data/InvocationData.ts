export interface InvocationData
{
    cl: number | null
    extended: boolean
    spell: string | null
    targets: Array<string>
}

export namespace InvocationData
{
    export const TEMPLATE: InvocationData = {
        cl: null,
        extended: false,
        spell: null,
        targets: [],
    }
}
