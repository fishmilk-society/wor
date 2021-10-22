/** Runs a (possibly asynchronous) function and prints how long it look. */
export async function time(description: string, fn: () => MaybePromise): Promise<void>
{
    const before = Date.now()

    await fn()

    const after = Date.now()
    console.log(`${description} took ${(after - before) / 1000}s`)
}
