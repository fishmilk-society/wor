declare global
{
    interface SocketConfig
    {
        hello(text: string): Promise<string>
    }
}

export namespace SocketConfig
{
    export function register(socket: SocketLib.Socket)
    {
        socket.register('hello', async text =>
        {
            alert(text)
            return text.toUpperCase()
        })
    }
}

export { }
