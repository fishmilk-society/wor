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

            html.find('input[data-edit=tint]').change(() =>
            {
                this._updateColor()
            })

            html.find('input[name=tint]').change(() =>
            {
                this._updateColor()
            })
        }
    }

    private _updateColor()
    {
        setTimeout(() =>
        {
            let source = this.element.find("input[name=tint]").val() as string
            const target = this.element.find(`#TintLarge${this.object.id} feColorMatrix`)

            source ||= '#ffffff'
            const r = parseInt(source.substr(1, 2), 16) / 255
            const g = parseInt(source.substr(3, 2), 16) / 255
            const b = parseInt(source.substr(5, 2), 16) / 255

            target.attr("values", `
            ${r} 0    0    0 0
            0    ${g} 0    0 0
            0    0    ${b} 0 0
            0    0    0    1 0`)
        }, 0)
    }

    async getData(options?: Application.RenderOptions)
    {
        const data = await super.getData(options)

        const effect = data.effect
        effect.tint ||= '#ffffff'
        const r = parseInt(effect.tint.substr(1, 2), 16) / 255
        const g = parseInt(effect.tint.substr(3, 2), 16) / 255
        const b = parseInt(effect.tint.substr(5, 2), 16) / 255

        // @ts-expect-error
        effect.tint2 = `
            ${r} 0    0    0 0
            0    ${g} 0    0 0
            0    0    ${b} 0 0
            0    0    0    1 0`

        return data
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
