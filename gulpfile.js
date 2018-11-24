'use strict';
const gulp = require('gulp');
const del = require('del');
const path = require('path');
const install = require('gulp-install');
const vinylPaths = require('vinyl-paths');
const less = require('less');
const map = require('map-stream');
const ejs = require('ejs');
const shell = require('gulp-shell');
const Vinyl = require('vinyl');
const nodeModulePattern = /node_modules\/(\w+-?\w+?)\//;
const MainFilePattern = /main.js$/;
const buildDir = __dirname + '/build/';

var components = [];

gulp.task('clean', function(done) {
  components = [];
  return gulp.src(['build/*', 'temp/*'],
      {allowEmpty: true}).pipe(vinylPaths(del)).on('end', () => done());
});

gulp.task('postBuildClean', function(done) {
  return gulp.src(['temp'],
      {allowEmpty: true}).pipe(vinylPaths(del)).on('end', () => done());
});

gulp.task('copyMainBuildFiles',
    function(done) {
      return gulp.src('src/main/webapp/**').
          pipe(gulp.dest('build/')).
          on('end', () => done());
    });

gulp.task('generateVariablesLessFile',
    function(done) {
      console.log('Copying less variables file');
      gulp.src('src/main/resources/bootstrap/config.json').
          pipe(map(function(file, cb) {
            var bootstrapConfig = JSON.parse(file.contents.toString());
            addZindexVariables(bootstrapConfig);
            var variablesLessFileContent = generateVariablesLessFileContent(
                bootstrapConfig);
            var lessFile = new Vinyl({
              cwd: '/',
              base: '/temp/less/',
              path: '/temp/less/variables.less',
              contents: new Buffer(variablesLessFileContent),
            });
            console.log('Writing variables.less file');
            cb(null, lessFile);
          })).
          pipe(gulp.dest('./temp/less/')).
          on('end', () => done());
    });

gulp.task('compileBaseStyle', function(done) {
  return gulp.src(['src/main/less/base.less']).pipe(map(function(file, cb) {
    less.render(
        file.contents.toString(), {
          paths: ['src/main/less', 'temp/less'],
        }).then(function(style) {
      console.log('Compiled style', file.path);
      file.contents = new Buffer(style.css);
      file.path = file.path.replace('.less', '.css');
      cb(null, file);
    }, function(err) {
      throw new Error(err);
    }).catch(function(err) {
      throw new Error('catch', err);
    });
  })).pipe(gulp.dest('build/frontend/assets/css')).on('end', () => done());
});

gulp.task('compileMainStyle', function(done) {
  return gulp.src(['src/main/less/main.less'],
      {allowEmpty: true}).pipe(map(function(file, cb) {
    less.render(
        file.contents.toString(), {
          paths: ['src/main/less', 'temp/less'],
        }).then(function(style) {
      console.log('Compiled style', file.path);
      file.contents = new Buffer(style.css);
      file.path = file.path.replace('.less', '.css');
      cb(null, file);
    }, function(err) {
      console.log(err);
      throw new Error(err);
    }).catch(function(err) {
      throw new Error('catch', err);
    });
  })).pipe(gulp.dest('build/frontend/assets/css')).on('end', () => done());
});

gulp.task('installMainDependencies',
    function(done) {
      return gulp.src([
            './bower.json', './build/bower.json', './build/package.json'],
          {allowEmpty: true}).pipe(install()).on('end', () => done());
    });

// TODO: Is this necessary with npm modules?
gulp.task('installComponentDependencies',
    function(done) {
      return gulp.src(['./bower_components/*/npm/package.json']).
          pipe(shell([
            'npm install <%= f(file) %>',
          ], {
            cwd: './build',
            templateData: {
              f: function(file) {
                var p = /^.*\/bower_components\/(.*)\/package[.]json/.exec(
                    file.path)[1];
                var result = file.base + p;
                console.log('Base:', result);
                return result;
              },
            },
          })).on('end', () => done());
    });

function compileStyles(glob, styles) {
  let lessPaths = ['src/main/less', 'temp/less'];

  console.log('compiling', glob);

  return gulp.src(glob).pipe(map(function(styleFile, cb) {

    less.render(
        styleFile.contents.toString(), {
          paths: lessPaths,
        }).then(function(style) {
      let key = path.basename(styleFile.path, '.less');
      styles[key] = style.css;
      styleFile.content = new Buffer(style.css);
      cb(null, styleFile);
    }, function(error) {
      console.log('Something went wrong trying to compile style', error);
    });

  }));
}

function compileComponentStyles(file, done) {

  var basename = path.basename(file.path); // basename = view.html
  var glob = file.path.replace(basename, '*.less');
  let styles = {};

  return compileStyles(glob, styles)
  .on('end', () => {
    if (Object.keys(styles).length > 0) {
      console.log('writing style to view file', file.path);
      let html = ejs.render(file.contents.toString(), styles);
      file.contents = new Buffer(html);
    }
    done(null, file)
  });


}

/**
 * Compiles styles
 * @private
 * @param {object} file - Style file
 * @param {function} cb - callback
 */
function compileThirdPartyComponentStyles(file, done) {

  console.log('Compiling styles', file.path);
  let styles = {};
  let sourceFilePattern = /^(.*)(src\/main\/)(.*)$/;
  if (!sourceFilePattern.test(file.path)) {
    return done();
  }
  let glob = file.path.replace(sourceFilePattern, '$1$2less/*.less');

  return compileStyles(glob, styles)
  .on('end', () => {
    if (Object.keys(styles).length > 0) {
      console.log('writing style to view file', file.path);
      let html = ejs.render(file.contents.toString(), styles);
      file.contents = new Buffer(html);
    }
    done(null, file)
  });
}

function fixComponentBasePath(file, cb) { // eslint-disable-line require-jsdoc
  if (file.path.match(/bower_components/)) {
    var componentName = /(\w+)\/component/.exec(file.path)[1];
    file.base += '/' + componentName + '/component/';
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

gulp.task('installDependencies', gulp.series(
    'installMainDependencies',
    'installComponentDependencies'), (done) => done());

gulp.task('copyComponentViewFiles', function(done) {
      return gulp.src([
        'src/main/component/**/View.html',
        'bower_components/*/component/**/View.html']).
          pipe(map(fixComponentBasePath)).
          pipe(map(compileComponentStyles)).
          pipe(gulp.dest('build/frontend/component')).
          on('end', () => done());
    });

gulp.task('copyControllerFiles', function(done) {
      return gulp.src([
        'src/main/component/**/*.js'
        ])
          .pipe(map(fixComponentBasePath))
          .pipe(gulp.dest('build/frontend/component'))
          .pipe(vinylPaths((path) => {
            if (MainFilePattern.test(path)) {
              console.log('Build dir', buildDir);
              var componentPath = getComponentPath(path);
              console.log("component path:", componentPath);
              components.push(componentPath);
            }
            return Promise.resolve();
          }))
          .on('end', () => done());
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

function processHtmlFiles(file, done) {
  let basename = path.basename(file.path); // basename = package.json
  let moduleName = nodeModulePattern.exec(file.path)[1];
  let dest = 'build/node_modules/' + moduleName + '/dist';
  let glob = file.path.replace(basename, 'src/**/*.html');
  gulp.src(glob).
      pipe(map(compileThirdPartyComponentStyles)).
      pipe(gulp.dest(dest)).
      on('end', () => done());
}

function filterWeldkitComponents(file, cb) {
  let packageInfo = JSON.parse(file.contents.toString());
  if (packageInfo.keywords &&
      packageInfo.keywords.includes('weldkit')) {
    var componentPath = getComponentPath(
        file.path.replace('package.json', packageInfo.main));
    components.push(componentPath);
    console.log('Compiling weldkit component', packageInfo.name);
    cb(null, file);
  } else {
    cb();
  }
}

function processWeldikComponent(file, cb) {
  return processHtmlFiles(file, cb);
}

gulp.task('compileThirdPartyComponents',
    (done) => {
      'use strict';

      console.log('compiling third party components');
      return gulp.src(['build/node_modules/*/package.json']).
          pipe(map(filterWeldkitComponents)).
          pipe(map(processWeldikComponent)).
          on('end', () => done());
    });

gulp.task('compileComponents', gulp.series(
    'copyComponentViewFiles',
    'copyControllerFiles'));

function getStyleFiles() {
  let result = [];
  const frontendFileRegex = /^.*\/(frontend\/.*)/;
  return new Promise((resolve) => {
    gulp.src(['build/frontend/assets/css/*.css',])
    .pipe(map((file, cb) => {
      let stylePath = frontendFileRegex.exec(file.path)[1];
      result.push(stylePath);
      cb();
    }))
    .on('end', () => resolve(result));
  });
}

gulp.task('generateIndexFile', function(done) {

      return gulp.src([
        'src/main/template/index.html',
      ])
      .pipe(map((file, cb) => {
        getStyleFiles()
        .then((styleFiles) => {
          var contents = ejs.render(
              file.contents.toString(), {
                components: components,
                styles: styleFiles,
              });
          file.contents = new Buffer(contents);
          console.log('Mapping in generateIndexFile', file.path);
          cb(null, file);
        });
      }))
      .pipe(gulp.dest('build'))
      .on('end', () => {
        console.log('Finished generateIndexFile');
        done();
      });
    });

gulp.task('build', gulp.series(
    'clean', 'copyMainBuildFiles', 'generateVariablesLessFile',
    'compileBaseStyle', 'compileMainStyle', 'installMainDependencies',
    'compileThirdPartyComponents', 'compileComponents',
    'generateIndexFile', 'postBuildClean',));

gulp.task('default', gulp.series('build'));

function getComponentPath(path) {
    return path.replace(buildDir, '/');
}
