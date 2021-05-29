// @ts-check
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
        typescript(),
        sass({
            output: 'dist/wor.css'
        })
    ]
}

export default config
