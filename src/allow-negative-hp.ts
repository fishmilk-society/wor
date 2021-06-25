/**
 * @file This module changes the token HUD to allow negative numbers for HP.
 */

import { replaceOnce } from "./helpers/replace-once"

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
