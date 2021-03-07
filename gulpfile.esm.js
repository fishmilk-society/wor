import gulp from 'gulp'
import gulplog from 'gulplog'
import PluginError from 'plugin-error'
import rollup from 'gulp-rollup'
import sass from 'gulp-dart-sass'
import ts from 'gulp-typescript'

export function css()
{
    return gulp.src('wor.sass')
        .pipe(sass())
        .on('error', handleError)
        .pipe(gulp.dest('dist'))

    function handleError(error)
    {
        const message = new PluginError('sass', error.messageOriginal).toString()
        gulplog.error(message)
        process.exitCode = 1
        this.emit('end')
    }
}

export function js()
{
    const tsProject = ts.createProject('tsconfig.json')

    return tsProject.src()
        .pipe(tsProject())
        .pipe(rollup({
            input: 'wor.js',
            output: { format: 'esm' }
        }))
        .pipe(gulp.dest('dist'))
}

export default gulp.series(css, js)
