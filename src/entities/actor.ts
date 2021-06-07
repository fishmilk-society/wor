export interface CharacterData
{
    hp: {
        value: number
        max: number
    }
    initiative: {
        final: number
    }
    speed: number
}

export interface CharacterActorData extends Actor.Data<CharacterData>
{
    type: "character"
}
