export function expect(condition: unknown): asserts condition
{
    if (!condition)
        throw new Error('Assertion failed')
}

export function unwrap<T>(value: T | null | undefined): T
{
    if (value === null || value === undefined)
        throw new Error('Assertion failed: value is null or undefined')
    return value
}

export function unhandledCase(which: unknown): never
{
    throw new Error(`Case was not handled: ${which}`)
}
