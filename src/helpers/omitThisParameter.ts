// A surprise tool that will help us later:
export function omitThisParameter<Function>(fn: Function): OmitThisParameter<Function>
{
    return fn as OmitThisParameter<Function>
}
