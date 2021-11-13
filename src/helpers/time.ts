import { unwrap } from "./assertions"

/** Runs a (possibly asynchronous) function and prints how long it look. */
export async function time(description: string, fn: () => MaybePromise): Promise<void>
{
    const before = Date.now()
    await fn()
    const after = Date.now()

    // Log how long it took:
    const taken = (after - before) / 1000
    console.log(`${description} took ${taken}s`)

    // Maybe even show a warning:
    if (taken > 0.25)
        unwrap(ui.notifications).warn(`${description} took ${taken}s`)
}
