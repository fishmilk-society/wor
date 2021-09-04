import { Client } from './client'
import { Log } from "./Log"

export const FoundryMQ = new Client({
    server: '/mq',
    listenOptions: { log: Log.write }
})
