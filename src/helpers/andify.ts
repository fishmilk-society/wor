/** Joins a set of items in an English-friendly way. */
export function andify(items: Array<string>): string
{
    if (items.length == 0)
        return ''
    else if (items.length == 1)
        return items[0]
    else if (items.length == 2)
        return items.join(' and ')

    else
        return items.slice(0, -1).join(', ') + ', and ' + items.at(-1)
}
