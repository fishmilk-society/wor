export const MODULE = 'wor'

export function getFullKey<K extends string>(partialKey: K): `wor.${K}`
{
    return `wor.${partialKey}`
}
