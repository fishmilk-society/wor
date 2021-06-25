/**
 * Replaces a string exactly one time. If @param find is not found, or is found more than once,
 * this method will throw an error.
 * @param contents The string to modify.
 * @param find What to search for.
 * @param replace What to replace it with.
 * @returns The modified string.
 */
export function replaceOnce(contents: string, find: string, replace: string): string
{
    const index = contents.indexOf(find)

    if (index == -1)
        throw new Error(`Could not find string ‘${find}’`)

    if (contents.indexOf(find, index + 1) != -1)
        throw new Error(`Found string ‘${find}’ more than once`)

    return contents.substring(0, index) + replace + contents.substring(index + find.length)
}
