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
        replace({
            'DEBUG': process.env.NODE_ENV != 'production',
            preventAssignment: true
        }),
        typescript(),
        sass({
            output: 'dist/wor.css'
        })
    ]
}

export default config
