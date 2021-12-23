/** A helper to generate an enumeration. */
function enumify<T extends string>(...values: Array<T>): Array<T>
{
    Object.freeze(values)
    return values
}

const __sizeCategories = enumify(
    'fine',
    'diminutive',
    'tiny',
    'small',
    'medium',
    'large',
    'huge',
    'gargantuan',
    'colossal')

export type SizeCategory = typeof __sizeCategories[0]

type StaticPart<T extends string> = {
    [K in T]: K
} & {
    values(): Array<T>
}

function staticPart<T extends string>(values: Array<T>): StaticPart<T>
{
    const result: any = {}
    for (const v of values)
        result[v] = v
    result.values = function() { return values }
    return result
}

export const SizeCategory: StaticPart<SizeCategory> = staticPart(__sizeCategories)
