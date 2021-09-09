import { ListenOptions, MessageHandler } from './types'

export async function runListenLoop<M>(args: ListenOptions & { queueUrl: string; handler: MessageHandler<M> })
{
    const delay = () => new Promise(res => setTimeout(res, args.retryDelay * 1000))
    const log = args.log

    FETCH_LOOP: while (true)
    {
        let message: M & { id: number }

        // Firstly, fetch the next message in the queue:
        try
        {
            const response = await fetch(`${args.queueUrl}/oldest?wait=${args.wait}`)
            switch (response.status)
            {
                case 200:
                    message = await response.json()
                    break
                case 204:
                    continue FETCH_LOOP
                default:
                    log(`An HTTP error occurred: ${response.status}`)
                    await delay()
                    continue FETCH_LOOP
            }
        }
        catch (ex)
        {
            log(`An exception occurred: ${ex.message}`)
            await delay()
            continue FETCH_LOOP
        }

        // Secondly, attempt (just once) to process the message:
        log(`Processing message ${JSON.stringify(message, undefined, ' ')}`)
        try
        {
            await args.handler(message)
        }
        catch (ex)
        {
            log(`An exception occurred: ${ex.message}`)
        }

        // Thirdly, delete the message:
        DELETE_LOOP: while (true)
        {
            try
            {
                const response = await fetch(`${args.queueUrl}/${message.id}`, { method: 'DELETE' })
                switch (response.status)
                {
                    case 200:
                        continue FETCH_LOOP
                    default:
                        log(`An HTTP error occurred: ${response.status}`)
                        await delay()
                        continue DELETE_LOOP
                }
            }
            catch (ex)
            {
                log(`An exception occurred: ${ex.message}`)
                await delay()
                continue DELETE_LOOP
            }
        }
    }
}
