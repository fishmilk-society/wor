interface Objects
{
    KeyboardManager: typeof KeyboardManager
    PerceptionManager: typeof PerceptionManager
    PointSource: typeof PointSource
    Token: typeof Token
}

type Lookup<T, Path> =
    (Path extends `${infer Key}.${infer RestOfPath}` ?
        (Key extends keyof T ?
            Lookup<T[Key], RestOfPath> :
            never) :
        (Path extends keyof T ?
            AddContextIfFunction<T[Path], T> :
            never))

type AddContextIfFunction<Value, Context> =
    (Value extends (...args: any) => any ?
        WithThisParameter<Value, Context> :
        Value)

type WithWrapper<Function> =
    (Function extends (this: infer This, ...args: infer Args) => infer Return ?
        (this: This, wrapped: (...args: Args) => Return, ...args: Args) => Return :
        unknown)

interface LibWrapper
{
    register<P extends string>(module: string, target: P, fn: WithWrapper<Lookup<Objects, P>>, mode: 'MIXED' | 'WRAPPER'): void
    register<P extends string>(module: string, target: P, fn: Lookup<Objects, P>, mode: 'OVERRIDE'): void
    register<F>(module: string, target: string, fn: WithWrapper<F>, mode: 'MIXED' | 'WRAPPER'): void
    register<F>(module: string, target: string, fn: F, mode: 'OVERRIDE'): void
}

export { }

declare global
{
    type WithThisParameter<Fn extends (...args: any) => any, This> =
        (this: This, ...args: Parameters<Fn>) => ReturnType<Fn>

    const libWrapper: LibWrapper
}
