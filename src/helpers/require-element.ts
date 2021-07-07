export function requireElement<T extends HTMLElement>(container: JQuery, name: string, T: ConstructorOf<T>)
{
    // Find the element:
    const query = container.find(`[name='${name}']`)

    // Ensure there’s exactly one:
    if (query.length == 0)
        throw new Error(`Could not find element with name ‘${name}’.`)
    if (query.length > 1)
        throw new Error(`Expected exactly one element with name ‘${name}’ but found ${query.length}.`)

    // Ensure it’s the right type:
    const element = query[0] as T
    if (!(element instanceof T))
        throw new Error(`Expected an element of type ‘${T}’ but found ${element.constructor.name}`)

    return element
}
