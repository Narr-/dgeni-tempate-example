var gulp = require('gulp');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('partials:docs', ['dgeni'], function () {
    return gulp.src(['dgeni_docs/ng/app/{src,.tmp}/**/*.html', 'dgeni_docs/ng/app/.tmp_docs/{partials,.tmp}/**/*.html'])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.ngHtml2js({
            moduleName: 'docApp'
        }))
        .pipe(gulp.dest('dgeni_docs/ng/app/.tmp_docs/partials'))
        .pipe($.size());
});

gulp.task('html:docs', ['wiredep:docs', 'partials:docs'], function () {
    var assets;
    var jsFilter = $.filter('**/*.js');
    return gulp.src(['dgeni_docs/ng/app/index.html'])
        .pipe($.inject(gulp.src('dgeni_docs/ng/app/.tmp_docs/partials/**/*.js'), {
            read: false,
            starttag: '<!-- inject:partials -->',
            addRootSlash: false,
            addPrefix: '../'
        }))
        /*
         .pipe($.inject(gulp.src('dgeni_docs/ng/app/env_*.js'), {
         read: false,
         starttag: '<!-- inject:env -->',
         addRootSlash: false,
         addPrefix: '../../'
         }))
         */
        .pipe(assets = $.useref.assets())
        .pipe(jsFilter)
        .pipe($.ngAnnotate())
        .pipe($.uglify({preserveComments: $.uglifySaveLicense}))
        .pipe(jsFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist_docs'))
        .pipe($.size());
});

gulp.task('examples:docs', ['dgeni'], function () {
    return gulp.src(['dgeni_docs/ng/app/.tmp_docs/{*.js,examples/**/*}'])
        .pipe(gulp.dest('dist_docs'))
        .pipe($.size());
});

gulp.task('fonts:docs', function () {
    return gulp.src($.mainBowerFiles({
        bowerDirectory: 'dgeni_docs/ng/bower_components',
        bowerJson: 'dgeni_docs/ng/bower.json'
    }))
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist_docs/fonts'))
        .pipe($.size());
});

// module:dist
gulp.task('build:docs', ['module:dist', 'html:docs', 'fonts:docs', 'examples:docs', 'copy_dependencies:examples']);
