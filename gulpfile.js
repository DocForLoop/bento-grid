const { src, dest, watch, series} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browsersync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rimraf = require('rimraf');

// Compile Sass for development
function scssDevTask() {
    return src('scss/style.scss', { sourcemaps: true })
        .pipe(sass({ includePaths: ['./scss'] }).on('error', sass.logError)) // Add the root SCSS directory for imports
        .pipe(dest('css', { sourcemaps: '.' }));
}

// Compile Sass for production
function scssBuildTask() {
    return src('scss/style.scss')
        .pipe(sass({ includePaths: ['./scss'] }).on('error', sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(dest('dist/css'));
}

// Clean dist folder
function cleanDist(done) {
    rimraf.sync(['dist']);  
    done();
}

// Copy HTML and Assets
function copyFiles() {
    return src(['index.html', 'assets/**/*'], { base: '.' })
        .pipe(dest('dist'));
}

// Serve and reload
function browserSyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: '.',
        },
        notify: {
            styles: {
                top: 'auto',
                bottom: '0',
                right: '0',
                left: 'auto',
                backgroundColor: '#444',
                color: '#fff',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '14px',
                textAlign: 'center',
            },
        },
        // Ensures CSS injection happens without a full page reload
        injectChanges: true,
    });
    cb();
}

function browserSyncReload(cb) {
    browsersync.reload();
    cb();
}

// Watch Task
function watchTask() {
    watch('*.html', browserSyncReload);
    watch('scss/**/*.scss', series(scssDevTask, browserSyncReload));
}

// Default Task
exports.default = series(scssDevTask, browserSyncServe, watchTask);

// Deploy Task
exports.build = series(cleanDist, scssBuildTask, copyFiles);
