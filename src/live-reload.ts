export function watch({ prefix, intervalInSeconds }: { prefix: string, intervalInSeconds: number }): void
{
    const allFiles = new Map<File.Key, File>()

    async function tick()
    {
        for (const file of findFilesToWatch({ prefix }))
        {
            if (!allFiles.has(file.key))
                allFiles.set(file.key, file)
        }

        await checkForUpdates(allFiles.values())

        setTimeout(tick, intervalInSeconds * 1000)
    }

    $(tick)
}

function* findFilesToWatch({ prefix }: { prefix: string }): Iterable<File>
{
    const elements = $<HTMLLinkElement>("link[rel=stylesheet]").toArray()
    for (const element of elements)
    {
        const url = element.getAttribute("href")
        if (url?.startsWith(prefix))
            yield new CssFile(element)
    }

    for (const key in _templateCache)
    {
        if (key.startsWith(prefix))
            yield new HbsFile(key)
    }
}

function checkForUpdates(files: Iterable<File>)
{
    const tasks = new Array<Promise<void>>()
    for (const file of files)
    {
        const task = file.checkForUpdates()
        tasks.push(task)
    }
    return Promise.all(tasks)
}

namespace File
{
    export type Key = string
}

interface File
{
    readonly key: File.Key
    checkForUpdates(): Promise<void>
}

abstract class BaseFile implements File
{
    private updated: Date
    protected abstract get url(): string
    protected abstract reload(): void

    protected constructor()
    {
        this.updated = new Date()
    }

    public get key(): File.Key
    {
        return this.url
    }

    public async checkForUpdates(): Promise<void>
    {
        const response = await fetch(this.url, {
            method: 'HEAD',
            headers: {
                'If-Modified-Since': this.updated.toUTCString()
            }
        })

        if (response.status == 304)
            return

        if (response.status != 200)
            return console.error(`WOR | Unexpected response code ‘${response.status}’ for ${this.url}`)

        let updated = response.headers.get('Last-Modified')
        if (updated === null)
            return console.error(`WOR | Missing response header ‘Last-Modified’ for ${this.url}`)

        console.log(`WOR | Change detected in ${this.url}; reloading…`)
        this.reload()
        this.updated = new Date(updated)
    }
}

class CssFile extends BaseFile
{
    public constructor(private readonly element: HTMLLinkElement)
    {
        super()
    }

    protected get url(): string
    {
        return this.element.href
    }

    protected reload(): void
    {
        this.element.href = this.element.href
    }
}

class HbsFile extends BaseFile
{
    public constructor(protected readonly url: string)
    {
        super()
    }

    protected reload(): void
    {
        delete _templateCache[this.url]
        for (const key in ui.windows)
        {
            const window = ui.windows[key]
            if (window.template == this.url)
                window.render()
        }
    }
}
