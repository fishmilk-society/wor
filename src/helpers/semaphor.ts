export default class Semaphore
{
    #current: Promise<void> | undefined

    #resolve = () => { };

    public async wait(): Promise<void>
    {
        while (this.#current)
            await this.#current
        this.#current = new Promise<void>(resolve => this.#resolve = resolve)
    }

    public release(): void
    {
        this.#current = undefined
        this.#resolve()
    }
}
