/**
 * A value indicating how an actor works:
 *
 * • `unique` The actor represents a single creature that has its own statblock, such as a player
 *            character or an important NPC.
 *
 * • `prototype` The actor represents a group of creatures that share the same statblock, such as
 *               “goblin” or “Sandpoint Guard.”
 *
 * • `instance` The actor represents a single member of a prototype, such as “goblin 1” or “Nelly
 *              the Guard.”
 */
export type Uniquity = 'unique' | 'prototype' | 'instance' | Error

export namespace Uniquity
{
    /**
     * Determines the uniquity of the specified actor.
     * @param context If specified, error messages may be more accurate.
     */
    export function of(actor: Actor, context?: TokenDocument): Uniquity
    {
        const prototypeIsLinked = actor.data.token.actorLink

        if (context)
        {
            const tokenIsLinked = context.data.actorLink
            if (tokenIsLinked && !prototypeIsLinked)
                return new Error('This token is linked, but its prototype is 𝗡𝗢𝗧.')
        }

        if (actor.isToken)
        {
            if (prototypeIsLinked)
                return new Error('This token is 𝗡𝗢𝗧 linked, but its prototype is.')
            else
                return 'instance'
        }

        const activeTokens = actor.getActiveTokens(undefined, true)
        for (const token of activeTokens)
        {
            const instanceIsLinked = token.data.actorLink
            if (prototypeIsLinked && !instanceIsLinked)
                return new Error('This actor’s prototype token is linked, but some of its instances are 𝗡𝗢𝗧.')
            if (!prototypeIsLinked && instanceIsLinked)
                return new Error('This actor’s prototype token is 𝗡𝗢𝗧 linked, but some of its instances are.')
        }

        if (prototypeIsLinked)
            return 'unique'
        else
            return 'prototype'
    }
}
