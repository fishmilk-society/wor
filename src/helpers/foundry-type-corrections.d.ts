declare namespace Hooks
{
    export interface StaticCallbacks
    {
        // @ts-expect-error
        updateToken: Hooks.UpdateEmbeddedEntity<Token.Data, Scene>
    }
}
