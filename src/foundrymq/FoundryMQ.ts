import { Client } from './client'
import { Logs } from "./lib:Logs"

export const FoundryMQ = new Client({
    server: '/mq',
    listenOptions: { log: Logs.append }
})
