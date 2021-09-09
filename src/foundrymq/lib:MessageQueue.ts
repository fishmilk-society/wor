import { Client } from './client'
import { Logs } from "./lib:Logs"

export const MessageQueue = new Client({
    server: '/mq',
    listenOptions: { log: Logs.append }
})
