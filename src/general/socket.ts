import { SocketConfig } from '../config/SocketConfig'
import { expect, unwrap } from '../helpers/assertions'

let socket: SocketLib.Socket | undefined

export function openSocket()
{
    expect(!socket)
    socket = socketlib.registerSystem('wor')
    SocketConfig.register(socket)
}

export function getSocket(): SocketLib.Socket
{
    return unwrap(socket)
}
