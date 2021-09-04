import { Client } from './client'
import { Log } from "./logs/Log"

export const FoundryMQ = new Client({
    server: '/mq',
    listenOptions: { log: Log.write }
})
