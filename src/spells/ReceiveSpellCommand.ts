import { Spell } from '../characters/CharacterSheet/Spell'
import StatusEffect from '../effects/StatusEffect'
import { expect, unwrap } from '../helpers/assertions'
import Duration from '../helpers/duration'
import { fromUuidChecked } from '../helpers/fromUuidChecked'
import { andify } from './andify'
import { ReceiveSpellDialog } from './ReceiveSpellDialog'

export interface ReceiveSpellCommandData
{
    cl: number
    extended: boolean
    spell: Item
    targets: Array<Actor>
}

export type Serialized<T> =
    T extends Array<infer I> ? Array<Serialized<I>> :
    T extends { uuid: string } ? string :
    T extends object ? { [K in keyof T]: Serialized<T[K]> } :
    T

export class ReceiveSpellCommand
{
    #data: ReceiveSpellCommandData
    #message?: ChatMessage

    constructor(data: ReceiveSpellCommandData)
    {
        this.#data = deepClone(data)
    }

    get duration(): Duration
    {
        const d = this.#data
        return Spell.calculateDuration(d.spell, {
            cl: d.cl,
            extended: d.extended,
            targets: d.targets.length,
        })
    }

    get needsGM()
    {
        return this.#data.targets.some(t => !t.isOwner)
    }

    async execute()
    {
        if (this.needsGM)
        {
            expect(game.user)

            await ChatMessage.create({
                flags: { wor: { request: this.#serialize() } },
                content: this.#requestDescription,
                user: game.user.id,
            })
        }
        else
        {
            const seconds = this.duration.toSeconds()

            const effectData = {
                label: this.#data.spell.name,
                icon: this.#data.spell.img,
                duration: { seconds },
                flags: {
                    wor: {
                        cl: this.#data.cl
                    }
                }
            }

            const promises = this.#data.targets.map(target =>
            {
                return StatusEffect.create(effectData, { parent: target })
            })

            await Promise.all(promises)

            if (this.#message)
            {
                await this.#message.update({
                    content: this.#message.data.content.replace(/^.* wants to add/, 'Added'),
                    'flags.wor': { '-=request': null },
                    user: game.userId,
                })
            }
            else if (!unwrap(game.user).isGM)
            {
                await ChatMessage.create({
                    content: this.#requestDescription.replace(/^.* wants to add/, 'Added'),
                    user: game.userId,
                })
            }
        }
    }

    #serialize(): Serialized<ReceiveSpellCommandData>
    {
        const d = this.#data
        return {
            cl: d.cl,
            extended: d.extended,
            spell: d.spell.uuid,
            targets: d.targets.map(t => t.uuid),
        }
    }

    get #requestDescription(): string
    {
        const d = this.#data
        const targetNames = andify(d.targets.map(t => t.name!))
        return `${unwrap(game.user).name} wants to add <i>${d.spell.name?.toLowerCase()}</i> to ${targetNames}.`
    }

    static async from(message: ChatMessage): Promise<ReceiveSpellCommand>
    {
        const ser = message.getFlag('wor', 'request')
        expect(ser)

        const data = {
            cl: ser.cl,
            extended: ser.extended,
            spell: await fromUuidChecked(ser.spell, Item, 'spell'),
            targets: await Promise.all(ser.targets.map(id => fromUuidChecked(id, Actor, 'character')))
        }

        const result = new ReceiveSpellCommand(data)
        result.#message = message
        return result
    }
}

Hooks.on('renderChatMessage', async (message, html) =>
{
    const request = message.getFlag('wor', 'request')
    if (request && unwrap(game.user).isGM)
    {
        html.find('.message-content').append(`
            <button data-action='wor-approve'><i class='fas fa-check'></i>Approve</button>
        `)
    }
})

Hooks.on('renderChatLog', function(_, html)
{
    html.on('click', '[data-action^=wor-]', async evt =>
    {
        const target = evt.currentTarget

        const action = target.dataset.action
        const messageId = target.closest('[data-message-id]').dataset.messageId

        const message = unwrap(game.messages).get(messageId)
        expect(message)
        const command = await ReceiveSpellCommand.from(message)
        command.execute()
    })
})
