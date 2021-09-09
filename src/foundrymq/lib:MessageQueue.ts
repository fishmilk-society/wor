/**
 * @file
 * This library exports {@link MessageQueue}.
 */

import { Client } from './client'
import { Logs } from './lib:Logs'

/**
 * A FoundryMQ client instance. Use {@link MessageQueue.on} to register listeners.
 */
export const MessageQueue = new Client({
    server: '/mq',
    listenOptions: { log: Logs.append }
})
