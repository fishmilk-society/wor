import Patcher from "./helpers/patcher"

Hooks.on('init', () =>
{
    Patcher.forClass(Token).forMethod('refresh').wrap(function(original)
    {
        return original()
    })
})

// Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function(config, html)
// {
//     const token = config.token

//     const scaleSlider = html.find('[name=scale]')[0] as HTMLInputElement

//     // @ts-expect-error
//     token.__refresh = token.refresh

//     token.refresh = function()
//     {
//         alert(token.sheet.rendered)
//         /*        const aaaa = token.data.scale
//                 token.data.scale = scaleSlider.valueAsNumber
//                 // @ts-expect-error
//                 token.__refresh()
//                 token.data.scale = aaaa*/
//     }

//     scaleSlider.addEventListener('input', () =>
//     {
//         token.refresh()
//     })
// })

// Hooks.on<Hooks.CloseApplication<TokenConfig>>('closeTokenConfig', function(config, html)
// {
//     // // @ts-expect-error
//     // config.token.refresh = config.token.__refresh
//     // // @ts-expect-error
//     // delete config.token.__refresh
//     // config.token.refresh()
// })
