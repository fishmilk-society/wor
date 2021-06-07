function replaceOnce(fn: string, FIND: string, REPLACE: string): string
{
    const index = fn.indexOf(FIND)

    if (index == -1)
        throw new Error(`Could not find string ‘${FIND}’`)

    if (fn.indexOf(FIND, index + 1) != -1)
        throw new Error(`Find string ‘${FIND}’ more than once`)

    return fn.substring(0, index) + REPLACE + fn.substring(index + FIND.length)
}

type ClassOf<T> = {
    new(...args: any): T
    prototype: T
}

function patch<
    T extends { [key in K]: Function },
    K extends keyof T
>(type: ClassOf<T>, key: K, patcher: (fn: string) => string)
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

Hooks.once('init', function()
{
    patch(Actor, 'modifyTokenAttribute', fn =>
    {
        fn = replaceOnce(fn, `async modifyTokenAttribute`, `async function modifyTokenAttribute`)
        fn = replaceOnce(fn, 'Math.clamped(0, ', 'Math.min(')
        return fn
    })
})
