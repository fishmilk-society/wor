export async function fromUuidSafe<T extends { type: string }>(uuid: string, T: ConstructorOf<T>, type: T['type']): Promise<T | Error>
{
    let document

    try
    {
        document = await fromUuid(uuid)
    }
    catch (err)
    {
        if (err instanceof Error)
            return err

        else
            return new Error(`${err}`)
    }

    if (document === null)
        return new Error(`Could not find ‘${uuid}’`)

    if (!(document instanceof T))
        return new Error(`‘${uuid}’ is not a ${T.name}`)

    if (document.type != type)
        return new Error(`‘${uuid}’ is not a ${type}`)

    return document
}
