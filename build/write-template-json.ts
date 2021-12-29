#!/usr/bin/env -S npx ts-node
import { CharacterData } from '../src/data/CharacterData'
import { InvocationData } from '../src/data/InvocationData'
import { SpellData } from '../src/data/SpellData'
import { writeFileSync } from 'fs'
import { join as joinPath } from 'path'

// type Data<U extends { type: string, data: object }, K extends string>
//     = U extends { type: K } & { data: infer R } ? R : never

// type Template = {
//     [K in ActorSource['type']]: Data<ActorSource, K>
// } & {
//     types: Array<ActorSource['type']>
// }

// also: https://stackoverflow.com/questions/60131681/make-sure-array-has-all-types-from-a-union

// interface CompleteArray<T> extends Array<T>
// {
//     asStrings(): Array<string>
// }

// function completeArrayBuilder<T extends string>()
// {
//     return {
//         with<U extends T[]>(...array: U & ([T] extends [U[number]] ? unknown : never)): CompleteArray<T>
//         {
//             const result = array as any
//             result.asStrings = function()
//             {
//                 return this
//             }
//             return result
//         }
//     }
// }

// const UPDATE_KEYS = completeArrayBuilder<keyof InvocationUpdateData>()
//     .with('cl', 'spell', 'targets')
//     .asStrings()

const json = JSON.stringify({
    Actor: {
        types: ['character'],
        character: CharacterData.TEMPLATE,
    },
    Item: {
        types: ['invocation', 'spell'],
        invocation: InvocationData.TEMPLATE,
        spell: SpellData.TEMPLATE,
    },
}, null, 4)

const dest = joinPath(__dirname, '..', 'template.json')
writeFileSync(dest, json)
