/**
 * @file This module changes the token HUD to allow negative numbers in the HP field.
 */

/**
 * Mix functionality into the @see Actor class.
 */
Hooks.once('init', function()
{
    patch(Actor, 'modifyTokenAttribute', fn =>
    {
        // Since the original was defined in a class but this one is just a loose function:
        fn = replaceOnce(fn, `async modifyTokenAttribute`, `async function modifyTokenAttribute`)

        // Remove the lower bound:
        fn = replaceOnce(fn, 'Math.clamped(0, ', 'Math.min(')

        return fn
    })
})

/**
 * Replaces a string exactly one time. If @param find is not found, or is found more than once,
 * this method will throw an error.
 * @param contents The string to modify.
 * @param find What to search for.
 * @param replace What to replace it with.
 * @returns The modified string.
 */
function replaceOnce(contents: string, find: string, replace: string): string
{
    const index = contents.indexOf(find)

    if (index == -1)
        throw new Error(`Could not find string ‘${find}’`)

    if (contents.indexOf(find, index + 1) != -1)
        throw new Error(`Found string ‘${find}’ more than once`)

    return contents.substring(0, index) + replace + contents.substring(index + find.length)
}

/**
 * Modifies an instance method using string manipulation.
 * @param type The class that contains the method.
 * @param key The name of the method to replace.
 * @param patcher A function which, given a function definition as a string, returns the new
 * function definition.
 */
function patch<
    T extends { [key in K]: Function },
    K extends keyof T
>(
    type: { new(...args: any): T; prototype: T },
    key: K,
    patcher: (fn: string) => string
)
{
    try
    {
        const oldFn = type.prototype[key].toString()
        const newFn = patcher(oldFn)
        type.prototype[key] = new Function('return ' + newFn)()
    }
    catch (error)
    {
        throw new Error(`Error patching ‘${type.name}.${key}’: ${error.message}`)
    }
}
