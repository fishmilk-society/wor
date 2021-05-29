import gulp from 'gulp'
import rollup from 'gulp-rollup'
import sass from 'gulp-dart-sass'
import ts from 'gulp-typescript'

export function css()
{
    return gulp.src('src/wor.sass')
        .pipe(sass())
        .on('error', handleError)
        .pipe(gulp.dest('dist'))

    function handleError(error)
    {
        console.error(error.messageOriginal)
        error.stack = 'Error: SASS: Compilation failed'
        throw error
    }
}

export function js()
{
    const tsProject = ts.createProject('tsconfig.json')

    return tsProject.src()
        .pipe(tsProject())
        .pipe(rollup({
            input: 'src/wor.js',
            output: { format: 'esm' }
        }))
        .pipe(gulp.dest('dist'))
}

export default gulp.series(css, js)
