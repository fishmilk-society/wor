/**
 * @file
 * TODO
 */

const KEYS_TO_PREVIEW = [
    'mirrorX',
    'mirrorY',
    'scale',
    'flags.wor.anchor.x',
    'flags.wor.anchor.y',
]

/**
 * Mix functionality into the {@link Token} class, but do it as late as possible.
 */
Hooks.on('ready', function()
{
    Token.prototype.refresh = (function()
    {
        const original = Token.prototype.refresh

        return function(this: Token)
        {
            // The public property is a lazy initiatilizer. We definitely don’t want to initialize
            // every token’s configuration dialog. Instead, access the private backing field:
            const sheet = this._sheet

            let oldData

            // If the dialog does not exist or is not visible:
            if (sheet?.rendered)
            {
                // Retrieve all the properties we’ll be changing:
                oldData = duplicate(this.data)

                const o = new FormDataExtended(sheet.form as HTMLFormElement, {}).toObject()
                for (let [k, v] of Object.entries(o))
                {
                    if (KEYS_TO_PREVIEW.includes(k))
                        setProperty(this.data, k, v)
                }
            }

            original.apply(this)

            if (oldData)
                // Revert the properties we changed:
                Object.assign(this.data, oldData)
        }
    })()
})

/**
 * When showing the token configuration dialog, attach some listeners.
 */
Hooks.on<Hooks.RenderApplication<object, TokenConfig>>('renderTokenConfig', function({ token }, html)
{
    // If this dialog is for a prototype token, do nothing:
    if (!token.icon)
        return

    html.on('input', function()
    {
        token.refresh()
    })
})

/**
 * When the token configuration dialog is dismissed, re-render (in case the user cancelled):
 */
Hooks.on<Hooks.CloseApplication<TokenConfig>>('closeTokenConfig', function({ token })
{
    // If this dialog is for a prototype token, do nothing:
    if (!token.icon)
        return

    token.refresh()
})
