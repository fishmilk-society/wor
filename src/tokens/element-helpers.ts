export function getSlider(html: JQuery, name: 'scale' | 'flags.wor.anchor.x' | 'flags.wor.anchor.y'): HTMLInputElement
{
    // Find the element:
    const query = html.find(`[name='${name}']`)
    if (query.length != 1)
        throw new Error(`Expected exactly one ‘scale’ slider but found ${query.length}`)

    // Make sure it’s an <input/>:
    const element = query[0] as HTMLInputElement
    if (!(element instanceof HTMLInputElement))
        throw new Error(`Expected an ‘HTMLInputElement’ but found ${element}`)

    return element
}
