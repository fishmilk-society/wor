import { Client } from './client'
import { Logs } from "./logs/Log"

export const FoundryMQ = new Client({
    server: '/mq',
    listenOptions: { log: Logs.append }
})
