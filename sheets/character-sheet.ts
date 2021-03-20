export class CharacterSheet extends ActorSheet
{
    static get defaultOptions(): BaseEntitySheet.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/sheets/character-sheet.hbs',
            width: 400,
            height: 'auto',
            resizable: false
        }
    }
}
