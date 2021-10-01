// Infer JSON types:
import * as json from "../../template.json"
namespace json
{
    // TODO: this doesn’t work well — find a way to generate template.json?
    export type CharacterTemplateData = typeof json.Actor.character & {
        attributes: { size: { category: ts.SizeCategory } }
    }
}

// Import defined types:
import * as ts from "./actor"

// Make sure CharacterData matches:
assert_is<ts.CharacterSourceData>(_ as json.CharacterTemplateData)
assert_is<json.CharacterTemplateData>(_ as ts.CharacterSourceData)

// Type assertion helpers:
declare const _: unknown
declare function assert_is<Type>(value: Type): void
