export default class EffectSheet extends ActiveEffectConfig
{
    static get defaultOptions(): FormApplication.Options
    {
        return {
            ...super.defaultOptions,
            template: 'systems/wor/src/sheets/effect-sheet.hbs',
            closeOnSubmit: false,
            submitOnClose: true,
            submitOnChange: true,
        }
    }

    activateListeners(html: JQuery)
    {
        super.activateListeners(html)
        // Support Image updates
        if (this.options.editable)
        {
            html.find('img[data-edit]').click(ev => this._onEditImage(ev))
        }
    }

    _onEditImage(event: JQuery.ClickEvent)
    {
        const attr = event.currentTarget.dataset.edit
        const current = getProperty(this.object.data, attr)
        new FilePicker({
            type: "image",
            current: current,
            // @ts-expect-error
            callback: path =>
            {
                event.currentTarget.src = path
                this._onSubmit(event as any)
            },
            // @ts-ignore
            top: this.position.top + 40,
            // @ts-ignore
            left: this.position.left + 10
        }).browse(current)
    }
}
