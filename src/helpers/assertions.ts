export function expect(condition: unknown): asserts condition
{
    if (!condition)
        throw new Error('Assertion failed')
}

export interface RedundantUnwrap
{
}

export function unwrap<T>(value: NonNullable<T>): RedundantUnwrap
export function unwrap<T>(value: T | null | undefined): T
export function unwrap(value: any)
{
    if (value === null || value === undefined)
        throw new Error('Assertion failed: value is null or undefined')
    return value
}

export function unhandledCase(which: unknown): never
{
    throw new Error(`Case was not handled: ${which}`)
}
