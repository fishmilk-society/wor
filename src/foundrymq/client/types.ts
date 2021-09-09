export type MessageHandler<M> = (message: M) => void | Promise<void>

export interface ListenOptions
{
    retryDelay: number
    wait: number
    log(message: string): void
}
