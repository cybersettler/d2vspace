'use strict';
const gulp = require('gulp');
const del = require('del');
const path = require('path');
const install = require('gulp-install');
const vinylPaths = require('vinyl-paths');
const less = require('less');
const map = require('map-stream');
const ejs = require('ejs');
const tap = require('gulp-tap');
const shell = require('gulp-shell');
const Vinyl = require('vinyl');

gulp.task('clean', function () {
    return gulp.src(['build/*', './src/main/less/variables.less'])
        .pipe(vinylPaths(del));
});

gulp.task('copyMainBuildFiles', ['clean'], function () {
    return gulp.src('src/main/webapp/**')
        .pipe(gulp.dest('build/'));
});

gulp.task('installMainDependencies', ['clean', 'copyMainBuildFiles',
    'generateVariablesLessFile', 'compileBaseStyle', 'compileMainStyle'], function () {
    return gulp.src([
        './bower.json', './build/bower.json', './build/package.json'])
        .pipe(install());
});

gulp.task('installComponentDependencies', ['installMainDependencies'],
    function () {
        return gulp.src(['./bower_components/*/npm/package.json'])
            .pipe(shell([
                'npm install <%= f(file) %>'
            ], {
                cwd: './build',
                templateData: {
                    f: function (file, base) {
                        var p = /^.*\/bower_components\/(.*)\/package[.]json/
                            .exec(file.path)[1];
                        return file.base + p;
                    }
                }
            }));
    });

/**
 * Compiles styles
 * @private
 * @param {object} file - Style file
 * @param {function} cb - callback
 */
function compileStyles(file, cb) {
    console.log('Compiling styles', file.path);
    var styles = {};
    var allCompillations = [];
    var basename = path.basename(file.path); // basename = view.html
    var glob = file.path.replace(basename, '*.less');
    var lessPaths = ['src/main/less'];
    if (file.path.match(/bower_components/)) {
        var p = /^.*\/(bower_components\/.*)\/component/
                .exec(file.base)[1] + '/resources/less';
        lessPaths.push(p);
    }
    console.log('compiling', glob);
    gulp.src(glob).pipe(tap(
        function (styleFile) {
            var process = less.render(
                styleFile.contents.toString(), {
                    paths: lessPaths
                }).then(function (style) {
                console.log('Compiled style', styleFile.path);
                var key = path.basename(styleFile.path, '.less');
                styles[key] = style.css;
            }, function (error) {
                console.log('Something went wrong trying to compile style', error);
            });
            allCompillations.push(process);
        }))
        .on('end', function () {
            Promise.all(allCompillations).then(function () {
                console.log('compile styles stream ended', file.path);
                if (Object.keys(styles).length > 0) {
                    console.log('writing style to view file', file.path);
                    var html = ejs.render(file.contents.toString(), styles);
                    file.contents = new Buffer(html);
                }
                cb(null, file);
            }, function (err) {
                throw new Error(err);
            }).catch(function (error) {
                console.log('Something went wrong trying to write view file', error);
            });
        });
}

function fixComponentBasePath(file, cb) { // eslint-disable-line require-jsdoc
    if (file.path.match(/bower_components/)) {
        var componentName = /(\w+)\/component/.exec(file.path)[1];
        file.base += componentName + '/component/';
    }
    cb(null, file);
}

function addZindexVariables(config) {
    config.vars['@zindex-navbar'] = 1000;
    config.vars['@zindex-dropdown'] = 1000;
    config.vars['@zindex-popover'] = 1060;
    config.vars['@zindex-tooltip'] = 1070;
    config.vars['@zindex-navbar-fixed'] = 1030;
    config.vars['@zindex-modal-background'] = 1040;
    config.vars['@zindex-modal'] = 1050;
}

gulp.task('copyComponentViewFiles', ['clean', 'copyMainBuildFiles',
    'compileBaseStyle','compileMainStyle',
    'installDependencies'], function () {
    return gulp.src(['src/main/component/**/View.html',
        'bower_components/*/component/**/View.html'])
        .pipe(map(fixComponentBasePath))
        .pipe(map(compileStyles))
        .pipe(gulp.dest('build/frontend/component'));
});

gulp.task('copyControllerFiles', ['clean', 'copyMainBuildFiles',
    'compileBaseStyle','compileMainStyle',
    'installDependencies'], function () {
    return gulp.src(['src/main/component/**/*.js',
        'bower_components/*/component/**/*.js'])
        .pipe(map(fixComponentBasePath))
        .pipe(gulp.dest('build/frontend/component'));
});

gulp.task('compileBaseStyle', ['copyMainBuildFiles',
    'generateVariablesLessFile'], function () {
    return gulp.src(['src/main/less/base.less'])
        .pipe(map(function (file, cb) {
            less.render(
                file.contents.toString(), {
                    paths: ['src/main/less']
                }).then(function (style) {
                console.log('Compiled style', file.path);
                file.contents = new Buffer(style.css);
                file.path = file.path.replace('.less', '.css');
                cb(null, file);
            }, function (err) {
                throw new Error(err);
            }).catch(function (err) {
                throw new Error('catch', err);
            });
        }))
        .pipe(gulp.dest('build/frontend/assets/css'));
});

gulp.task('compileMainStyle', [
    'copyMainBuildFiles',
    'generateVariablesLessFile',
    'compileBaseStyle'], function () {
    return gulp.src(['src/main/less/main.less'])
        .pipe(map(function (file, cb) {
            less.render(
                file.contents.toString(), {
                    paths: ['src/main/less']
                }).then(function (style) {
                console.log('Compiled style', file.path);
                file.contents = new Buffer(style.css);
                file.path = file.path.replace('.less', '.css');
                cb(null, file);
            }, function (err) {
                    console.log(err);
                throw new Error(err);
            }).catch(function (err) {
                throw new Error('catch', err);
            });
        }))
        .pipe(gulp.dest('build/frontend/assets/css'));
});

gulp.task('generateVariablesLessFile', ['clean'], function () {
    console.log('Copying less variables file');
    gulp.src('src/main/resources/bootstrap/config.json')
        .pipe(map(function (file, cb) {
            var bootstrapConfig = JSON.parse(file.contents.toString());
            addZindexVariables(bootstrapConfig);
            var variablesLessFileContent = generateVariablesLessFileContent(
                bootstrapConfig);
            var lessFile = new Vinyl({
                cwd: '/',
                base: '/src/main/less/',
                path: '/src/main/less/variables.less',
                contents: new Buffer(variablesLessFileContent)
            });
            console.log('Writing variables.less file');
            cb(null, lessFile);
        }))
        .pipe(gulp.dest('./src/main/less/'));
});

/**
 * Generates less variables content
 * @private
 * @param {object} bootstrapConfig - Bootstrap configuration
 * @return {string} file content
 */
function generateVariablesLessFileContent(bootstrapConfig) {
    var key;
    var value;
    var line;
    var content = [];
    for (key in bootstrapConfig.vars) {
        if (!{}.hasOwnProperty.call(bootstrapConfig.vars, key)) {
            continue;
        }
        value = bootstrapConfig.vars[key];
        if (/["]/.test(value)) {
            value = value.replace(/"/g, '\"'); // eslint-disable-line no-useless-escape
        }
        line = key + ': ' + value + ';';
        content.push(line);
    }
    return content.join('\n');
}

gulp.task('generateIndexFile', ['compileComponents'], function () {
    var viewFiles = [];
    var styleFiles = [];
    return gulp.src([
        'build/frontend/component/core/App/*.html',
        'build/frontend/component/**/*.html',
        'build/frontend/assets/css/*.css',
        'src/main/template/index.html'
    ])
        .pipe(vinylPaths(function (p) {
            var cssRegex = /[.]css$/;
            var htmlRegex = /[.]html$/;
            var frontendFileRegex = /^.*\/(frontend\/.*)/;
            var frontendPathRegex = /^.*\/frontend\/.*/;

            if (cssRegex.test(p)) {
                var stylePath = frontendFileRegex.exec(p)[1];
                styleFiles.push(stylePath);
            } else if (htmlRegex.test(p) && frontendPathRegex.test(p)) {
                console.log('storing path:', p);
                var viewPath = frontendFileRegex.exec(p)[1];
                viewFiles.push(viewPath);
            }
            return Promise.resolve();
        }))
        .pipe(map(function (file, cb) {
            if (/index[.]html$/.test(file.path)) {
                var contents = ejs.render(
                    file.contents.toString(), {
                        components: viewFiles,
                        styles: styleFiles
                    });
                file.contents = new Buffer(contents);
                cb(null, file);
            }
            cb();
        }))
        .pipe(gulp.dest('build'));
});

gulp.task('installDependencies', ['installMainDependencies',
    'installComponentDependencies']);
gulp.task('compileComponents', ['copyComponentViewFiles',
    'copyControllerFiles']);
gulp.task('build', [
    'clean', 'copyMainBuildFiles', 'generateVariablesLessFile',
    'compileBaseStyle', 'compileMainStyle',
    'compileMainStyle', 'installDependencies',
    'compileComponents', 'generateIndexFile'
]);
gulp.task('default', ['build']);
