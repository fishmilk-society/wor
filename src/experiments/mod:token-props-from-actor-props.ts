import { Uniquity } from "../helpers/Uniquity"

Hooks.on('updateToken', function(token: TokenDocument, update: object, options: object, userId: string)
{
})

Hooks.on('updateActor', function(actor: Actor, update: object, options: object, userId: string)
{
    debugger

    const uniquity = Uniquity.of(actor)

    console.log(update)
})
