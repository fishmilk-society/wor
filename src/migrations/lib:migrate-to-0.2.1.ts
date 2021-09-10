import { expect } from "../helpers/assertions"

export async function migrateTo_0_2_1(): Promise<void>
{
    expect(game.actors)
    expect(game.scenes)
    expect(ui.notifications)

    const actors = new Counter()
    const prototypeTokens = new Counter()
    const settings = new Counter()
    const tokenActors = new Counter()
    const tokens = new Counter()

    for (const scene of game.scenes)
    {
        for (const token of scene.tokens)
        {
            await migrateToken(token, tokens)
            if (token.actor?.isToken)
                await migrateActor(token.actor, tokenActors)
        }
    }

    for (const actor of game.actors)
    {
        await migratePrototypeToken(actor, prototypeTokens)
        await migrateActor(actor, actors)
    }

    if (game.settings.get('combat-numbers', 'hp_object_path') == 'hp.value')
    {
        await game.settings.set('combat-numbers', 'hp_object_path', '')
        settings.add()
    }

    if (game.settings.get('drag-ruler', 'speedProviders.native.setting.speedAttribute') == 'actor.data.data.speed')
    {
        await game.settings.set('drag-ruler', 'speedProviders.native.setting.speedAttribute', 'actor.data.data.attributes.speed.base')
        settings.add()
    }

    const defaultToken = game.settings.get('core', 'defaultToken') as any
    if (defaultToken.bar1.attribute == 'hp')
    {
        defaultToken.bar1.attribute = 'attributes.hp'
        await game.settings.set('core', 'defaultToken', defaultToken)
        settings.add()
    }

    ui.notifications.warn(`Migrated ${actors.total} actors.`)
    ui.notifications.warn(`Migrated ${prototypeTokens.total} prototype tokens.`)
    ui.notifications.warn(`Migrated ${settings.total} settings.`)
    ui.notifications.warn(`Migrated ${tokenActors.total} token actors.`)
    ui.notifications.warn(`Migrated ${tokens.total} tokens.`)
}

interface CharacterSourceData_0_2_0
{
    hp: {
        value: number
        max: number
    }
    initiative: {
        final: number
    }
    speed: number
    heroLabSync: {
        lastUpdate: number
        file: string
        character: string
    }
}

interface CharacterSourceData_0_2_1
{
    attributes: {
        hp: {
            value: number
            max: number
        }
        init: number
        speed: {
            base: number
        }
    }
    heroLabSync: {
        lastUpdate: number
        file: string
        character: string
    }
}

type AllNulls<T> = {
    [P in keyof T]: null
}

class Counter
{
    #value = 0
    get total(): number { return this.#value }
    add() { this.#value++ }
}

async function migrateActor(actor: Actor, counter: Counter): Promise<void>
{
    const oldData = actor.data.data as any as CharacterSourceData_0_2_0
    if (!oldData.hp)
        return

    const deleteOldValues: AllNulls<CharacterSourceData_0_2_0> = {
        hp: null,
        initiative: null,
        speed: null,
        heroLabSync: null
    }

    const addNewValues: CharacterSourceData_0_2_1 = {
        attributes: {
            hp: oldData.hp,
            init: oldData.initiative.final,
            speed: { base: oldData.speed }
        },
        heroLabSync: oldData.heroLabSync
    }

    await actor.update({
        data: { ...deleteOldValues, ...addNewValues } as any
    })

    counter.add()
}

async function migratePrototypeToken(actor: Actor, counter: Counter): Promise<void>
{
    if (actor.data.token.bar1.attribute == 'hp')
    {
        await actor.update({ 'token.bar1.attribute': 'attributes.hp' })
        counter.add()
    }
}

async function migrateToken(token: TokenDocument, counter: Counter): Promise<void>
{
    if (token.data.bar1.attribute == 'hp')
    {
        await token.update({ 'bar1.attribute': 'attributes.hp' })
        counter.add()
    }
}
