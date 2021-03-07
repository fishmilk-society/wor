declare class ActorSheet
{
    static defaultOptions: any
}

declare function mergeObject(...args: any): any

export class CharacterSheet extends ActorSheet
{
    static get defaultOptions()
    {
        return mergeObject(super.defaultOptions, {
            classes: ['wor', 'character-sheet'],
            template: 'systems/wor/templates/character-sheet.hbs',
            width: 400,
            height: 'auto',
            resizable: false
        })
    }
}
