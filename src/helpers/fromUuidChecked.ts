export async function fromUuidChecked<T extends { type: string }>(uuid: string, T: ConstructorOf<T>, type: T['type']): Promise<T>
{
    const document = await fromUuid(uuid)

    if (document === null)
        throw new Error(`Could not find ‘${uuid}’`)

    if (!(document instanceof T))
        throw new Error(`‘${uuid}’ is not a ${T.name}`)

    if (document.type != type)
        throw new Error(`‘${uuid}’ is not a ${type}`)

    return document
}
