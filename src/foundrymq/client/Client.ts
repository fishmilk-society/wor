import { UpdateActorMessage } from '../../../foundrymq/messages/UpdateActorMessage'
import { ListenOptions, MessageHandler } from './types'
import { runListenLoop } from './runListenLoop'

export class Client
{
    readonly #server: string
    readonly #listenOptions: ListenOptions

    constructor(args: { server: string, listenOptions?: Partial<ListenOptions> })
    {
        this.#server = args.server.replace(/\/$/, '')
        this.#listenOptions = {
            retryDelay: 10,
            wait: 50,
            log() { },
            ...args.listenOptions
        }
    }

    on(queueId: `UpdateActor:v1:${string}`, handler: MessageHandler<UpdateActorMessage>): void
    {
        runListenLoop({
            ...this.#listenOptions,
            queueUrl: `${this.#server}/${queueId}`,
            handler,
        })
    }
}
