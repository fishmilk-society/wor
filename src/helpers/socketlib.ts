interface SocketConfig
{
}

namespace SocketLib
{
    export interface Socket
    {
        register<K extends keyof SocketConfig>(name: K, func: SocketConfig[K]): void
        executeAsGM<K extends keyof SocketConfig>(handler: K, ...args: Parameters<SocketConfig[K]>): ReturnType<SocketConfig[K]>
    }
}

declare const socketlib: {
    registerSystem(name: string): SocketLib.Socket
}
