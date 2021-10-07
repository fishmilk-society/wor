// @ts-check
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'
import sass from 'rollup-plugin-sass'

/** @type {import('rollup').RollupOptions} */
const config = {
    input: 'src/main.ts',
    output: {
        file: 'dist/wor.js',
        format: 'esm'
    },
    plugins: [
        hbs(),
        replace({
            'DEBUG': process.env.NODE_ENV != 'production',
            preventAssignment: true
        }),
        sass({
            output: 'dist/wor.css'
        }),
        typescript(),
    ]
}

/** @returns {import('rollup').Plugin} */
function hbs()
{
    const dirToReplace = process.cwd() + '/'

    return {
        name: 'hbs',
        load(id)
        {
            if (id.endsWith('.hbs'))
            {
                if (!id.startsWith(dirToReplace))
                    return this.error(`Expected path to start with ‘${dirToReplace}’.\nActual value: ${id}`)

                const href = `systems/wor/${id.substring(dirToReplace.length)}`

                return `export default ${JSON.stringify(href)}`
            }
        }
    }
}

export default config
