// Infer JSON types:
import * as json from "../../template.json"
namespace json
{
    export type CharacterData = typeof json.Actor.character
}

// Import defined types:
import * as ts from "./actor"

// Make sure CharacterData matches:
assert_is<ts.CharacterData>(_ as json.CharacterData)
assert_is<json.CharacterData>(_ as ts.CharacterData)

// Type assertion helpers:
declare const _: unknown
declare function assert_is<Type>(value: Type): void
