import gulp from "gulp";
import sass from "gulp-dart-sass";
import PluginError from "plugin-error";
import gulplog from "gulplog";

export function css() {
    return gulp.src("wor.sass")
        .pipe(sass())
        .on("error", handleError)
        .pipe(gulp.dest("dist"));

    function handleError(error) {
        const message = new PluginError("sass", error.messageOriginal).toString();
        gulplog.error(message);
        process.exitCode = 1;
        this.emit("end");
    }
}

export default gulp.series(css);
