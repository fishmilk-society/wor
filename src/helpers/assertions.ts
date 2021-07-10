export function ensure(condition: unknown): asserts condition
{
    if (!condition)
        throw new Error('Assertion failed')
}

export function unhandledCase(which: unknown): never
{
    throw new Error(`Case was not handled: ${which}`)
}
