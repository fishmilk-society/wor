#!/usr/bin/env -S npx ts-node
import { CharacterSourceData } from '../src/data/CharacterSourceData'
import { writeFileSync } from 'fs'
import { join as joinPath } from 'path'

// type Data<U extends { type: string, data: object }, K extends string>
//     = U extends { type: K } & { data: infer R } ? R : never

// type Template = {
//     [K in ActorSource['type']]: Data<ActorSource, K>
// } & {
//     types: Array<ActorSource['type']>
// }

const json = JSON.stringify({
    Actor: {
        types: ['character'],
        character: CharacterSourceData.TEMPLATE,
    }
}, null, 4)

const dest = joinPath(__dirname, '..', 'template.json')
writeFileSync(dest, json)
