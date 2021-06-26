import LibWrapper from "./helpers/strongly-typed-lib-wrapper"

Hooks.on('init', () =>
{
    LibWrapper.forClass(Token).forMethod('refresh').wrap(function(original)
    {
        // @ts-expect-error
        const sheet = this._sheet

        if (sheet?.rendered)
        {
            const scaleSlider = sheet.element.find('[name=scale]')[0] as HTMLInputElement

            const prev = this.data.scale
            this.data.scale = scaleSlider.valueAsNumber
            original()
            this.data.scale = prev
            return
        }

        original()
    })
})

Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function(config, html)
{
    const token = config.token

    const scaleSlider = html.find('[name=scale]')[0] as HTMLInputElement


    scaleSlider.addEventListener('input', () =>
    {
        token.refresh()
    })
})

Hooks.on<Hooks.CloseApplication<TokenConfig>>('closeTokenConfig', function(config)
{
    config.token.refresh()
})

