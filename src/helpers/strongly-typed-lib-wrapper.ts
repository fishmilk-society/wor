function forClass<TType>(classToPatch: ClassOf<TType>): ClassPatcher<TType>
{
    return {
        forMethod(methodName: any)
        {
            return {
                wrap(fn: any)
                {
                    const target = `${classToPatch.name}.prototype.${methodName}`
                    libWrapper.register('wor', target, fn, 'WRAPPER')
                }
            }
        }
    } as any
}

interface ClassOf<T>
{
    new(...args: any): T
    prototype: T
}

interface ClassPatcher<TType>
{
    forMethod<
        TKey extends keyof TType,
        TFunction extends TType[TKey]
    >(name: TKey): TFunction extends ((...args: infer TArgs) => infer TReturn) ? FunctionPatcher<(this: TType, original: TFunction, ...args: TArgs) => TReturn> : never
}

interface FunctionPatcher<TWrapper>
{
    wrap(fn: TWrapper): void
}

export default { forClass }
