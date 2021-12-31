import { Spell } from "../characters/CharacterSheet/Spell"
import StatusEffect from "../effects/StatusEffect"
import { fromUuidChecked } from "../helpers/fromUuidChecked"

type BuilderParams = { cl: number; extended: boolean }

export class ReceiveSpellPayload
{
}

export namespace ReceiveSpell1
{
    export interface Payload
    {
        cl: number
        extended: boolean
        spell: string
        targets: Array<string>
    }

    export async function execute(data: Payload): Promise<void>
    {
        const spell = await fromUuidChecked(data.spell, Item, 'spell')
        const targets = await Promise.all(data.targets.map(t => fromUuidChecked(t, Actor, 'character')))

        const params = {
            cl: data.cl,
            extended: data.extended,
            targets: targets.length,
        }
        const duration = Spell.calculateDuration(spell, params)
        const seconds = duration.toSeconds()

        const effectData = {
            label: spell.data.name,
            icon: spell.data.img,
            duration: { seconds },
            flags: {
                wor: {
                    cl: data.cl
                }
            }
        }

        const promises = targets.map(target =>
        {
            return StatusEffect.create(effectData, { parent: target })
        })

        await Promise.all(promises)
    }
}


