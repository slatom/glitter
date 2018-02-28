/* eslint-disable */

"use strict";

const gulp = require('gulp');
const util = require('gulp-util');
const file = require('gulp-file');
const merge = require('merge-stream');
const pathExists = require('path-exists').sync;

const config = require('neonaut-lib-gulp/config');

const bin = require('neonaut-lib-gulp/copy-bin');
const clean = require('neonaut-lib-gulp/clean');
const compress = require('neonaut-lib-gulp/compress');
const css = require('neonaut-lib-gulp/css');
const img = require('neonaut-lib-gulp/img');
const js = require('neonaut-lib-gulp/js');

/*********************************
 * project configuration options *
 *********************************/

// ----- feature detection  -------------------------------------------------------------------------------------
// to add feature detection add lines below
// See modernizr documentation for more information. https://modernizr.com/docs
//config.jsModernizrOptions['feature-detects'].push('css/transforms');
//config.jsModernizrOptions['feature-detects'].push('css/transitions');

// ----- html5 shiv  --------------------------------------------------------------------------------------------
// to use html5printshiv instead of html5shiv uncomment next line
// See html5shiv documentation for more information. https://github.com/aFarkas/html5shiv
//config.jsHtml5Shiv = 'html5printshiv';

// or to disable html5shiv completely uncomment next line
//config.jsHtml5Shiv = '';

// ----- browser support ----------------------------------------------------------------------------------------
// to add browsers that should be supported by e.g. using vendor prefixes add lines below
// See 'browserlist' documentation for more information: https://github.com/ai/browserslist
//config.supportedBrowsers.push('Firefox 8');

// ----- js compression -----------------------------------------------------------------------------------------
// to enable unsafe transforms (reducing js size further) uncomment next line
// Use with care!
//config.jsCompressUnsafe = true;

// to disable removing console.* calls uncomment next line
//config.jsDropConsole = false;

// ----- js libraries bundle ------------------------------------------------------------------------------------
// to reset packages that will be in the libraries bundle (libs.js) uncomment next line
config.jsLibBundleDependencies = [
	'delegate',
	'gsap'
];

// to add packages to the libraries bundle (libs.js) add lines below
//config.jsLibBundleDependencies.push('jquery');

// to remove packages from the libraries bundle (libs.js) add lines below
//config.jsLibBundleBlacklist.push('moment');

// ----- dist --------------------------------------------------------------------------------------------------
// to allow non-built files in dist (e.g. typo3 extensions) uncomment next line
// Use with care! It will delete everything within dist when using clean task
// @deprecated dist should ideally be only built (or copied) files coming from src.
//      But there might be sensible reasons for that (e.g. typo3 extensions, kirby projects)
//config.simpleClean = false;

// change where built files should go
// e.g. for typo3 extensions uncomment next lines
config.pathDist = config.pathRoot + 'dist/';
config.pathDistCss = config.pathDist + 'Resources/Public/Css/';
config.pathDistImages = config.pathDist + 'Resources/Public/Images/';
config.pathDistJs = config.pathDist + 'Resources/Public/JavaScript/';

// or e.g. for kirby projects uncomment next lines
//config.pathDist = config.pathRoot + 'dist/assets/';
//config.pathDistCss = config.pathDist + 'css/';
//config.pathDistImages = config.pathDist + 'img/';
//config.pathDistJs = config.pathDist + 'js/';

// ----- compression  -------------------------------------------------------------------------------------------
// Options object to pass through to zlib.Gzip.
// See zlib documentation for more information. http://nodejs.org/api/zlib.html#zlib_options
//config.gzipOptions.level = 9;

// ----- svg2png ------------------------------------------------------------------------------------------------
// to build png fallbacks for images uncomment next line
//config.svgBuildPngFallback = true;

// ----- svg2js -------------------------------------------------------------------------------------------------
// enabled filtering of svg2js stored svgs. usually you won't need this
//config.js2svgRegExp = '\\.stele *\\{[^}]*\\}';
// generate svg data only. usally you want the full definitions, so keep it at the default: false
//config.js2svgDataOnly = true;

/*****************************
 * auto change configuration *
 *****************************/

if (pathExists(config.pathBowerComponents)) {
	util.log(util.colors.blue('Found bower path, adapting build process'));
	config.jsLibPaths.push(config.pathBowerComponents);
	config.scssLibPaths.push(config.pathBowerComponents);
	config.cssLibPaths.push(config.pathBowerComponents);
}

if (pathExists(config.pathVendor)) {
	util.log(util.colors.blue('Found vendor path, adapting build process'));
	config.jsLibPaths.push(config.pathVendor);
	config.scssLibPaths.push(config.pathVendor);
	config.cssLibPaths.push(config.pathVendor);
}

/********************
 * task definitions *
 ********************/

// list of tasks to be called with 'js'. These must be defined below. List may be extended below, if needed.
const jsTasks = [];

// list of tasks to be called before js-libs or any Tasks defined with js.jsAppIncludeLibs
const jsLibTaskDependencies = [];

// list of tasks to be called before css
const cssTaskDependencies = ['img'];

// ----- conditional task svg2js  -------------------------------------------------------------------------------
// 'js-libs' automatically build svg2js if needed
if (pathExists(config.pathSrcSvg2js)) {
	util.log(util.colors.blue('Found svg2js src path, adapting build process'));
	config.jsLibPaths.push(config.pathTmp + 'svg2js-data');
	config.jsLibBundleDependencies.push('svg2js-data');
	gulp.task('svg2js', require('neonaut-lib-gulp/svg2js/svg2js').svg2js);
	jsLibTaskDependencies.push('svg2js');
}

// ----- conditional task svg-sprites ---------------------------------------------------------------------------
if (pathExists(config.pathSrcSvgSprites)) {
	util.log(util.colors.blue('Found svg sprites src path, adapting build process'));
	gulp.task('svg-sprites', () => require('neonaut-lib-gulp/svg-sprites').svgSpritesTask());
	gulp.task('svg-sprites-images', ['svg-sprites'], () => img.img(config.pathTmp + 'svg-sprites/').on('end', () => compress.compressDistSvg()));
	cssTaskDependencies.push('svg-sprites-images');
}

// ----- conditional task sprity --------------------------------------------------------------------------------
if (pathExists(config.pathSrcSprity)) {
	util.log(util.colors.blue('Found sprity src path, adapting build process'));
	gulp.task('sprity', require('neonaut-lib-gulp/sprity').sprityTask);
	cssTaskDependencies.push('sprity');
} else {
	file(config.sprityDistName + '.css', '/* intentionally empty sprity css. you can import this file even if there is no sprity src */', {src: true})
		.pipe(gulp.dest(config.pathTmp));
}

// ----- conditional task svg icons -----------------------------------------------------------------------------
if (pathExists(config.pathSrcSvgIcons)) {
	util.log(util.colors.blue('Found svg icons src path, adapting build process'));
	gulp.task('svg-icons', () => require('neonaut-lib-gulp/svg-icons').svgIconsTask());
	cssTaskDependencies.push('svg-icons');
}

// ----- define tasks  ------------------------------------------------------------------------------------------
// clean built and temporary files
gulp.task('clean', () => clean.clean());

// "quality assure" javascript
gulp.task('js-hint', () => js.jsHint());
jsTasks.push('js-hint');

// build head.js
gulp.task('js-head-pre', js.jsModernizr); // special case using callback
gulp.task('js-head', ['js-head-pre'], () => js.jsHead());
jsTasks.push('js-head');

// build libs.js
gulp.task('js-libs', jsLibTaskDependencies, () => js.jsLibs());
jsTasks.push('js-libs');

// build app.js
gulp.task('js-app', () => js.jsApp());
jsTasks.push('js-app');

// build unmodularized-app.js
//gulp.task('js-unmodularized-app', () => js.jsUnmodularizedApp(
//	[
//		config.pathSrcJs + 'unmodularized-app/a.js',
//		config.pathSrcJs + 'unmodularized-app/b.js'
//	],
//	'unmodularized-app.js'
//));
//jsTasks.push('js-unmodularized-app');

// install npm (server) environment
//gulp.task('js-install-npm-env', () => js.jsInstallNpmEnvironment());
//jsTasks.push('js-install-npm-env');

// build server.js
//gulp.task('js-server', () => js.jsNodeJsApp('server.js'));
//jsTasks.push('js-server');

// or build app.js from app.jsx when using JSX in the root of your application
//gulp.task('js-app', () => js.jsApp('app.jsx', 'app.js'));
//jsTasks.push('js-app');

// to add additional js tasks add lines below
//gulp.task('js-app2', () => js.jsApp('app2.js'));
//jsTasks.push('js-app2');

// or put all libs into the main js file.
// This may or may not work with your beloved library!
//gulp.task('js-app2', jsLibTaskDependencies, () => js.jsAppIncludeLibs('app2.js'));
//jsTasks.push('js-app2');

// ----- define high level tasks --------------------------------------------------------------------------------
gulp.task('bin', [],                  config.isDev ? () => bin.copyBin() : () => merge(bin.copyBin(), compress.compressBin()));  // the compression can run concurrently
gulp.task('css', cssTaskDependencies, config.isDev ? () => css.css()     : () => css.css().on('end', () => compress.compressDistCss()));
gulp.task('img', [],                  config.isDev ? () => img.img()     : () => img.img().on('end', () => compress.compressDistSvg()));
gulp.task('js',  jsTasks,             config.isDev ? undefined           : () => compress.compressDistJs());

gulp.task('default', ['bin', 'css', 'img', 'js']);

/*********************
 * watch definitions *
 *********************/

function watch() {
	// bin
	gulp.watch(
		[
			`${config.pathSrcCopy}**/*`, // the "main" directory "bin"
			`${config.pathSrcCopy.slice(0, -1)}-*/**/*` // other directories in src starting with "bin-". Eg bin-html -> dist/html
		],
		['bin']
	);

	// css
	gulp.watch(
		[
			`${config.pathSrcScss}**/*`,
			`${config.pathSrcSvgSprites}**/*`,
			`${config.pathSrcSprity}**/*`
		],
		['css']
	);

	// img
	gulp.watch(
		[
			`${config.pathSrcImages}**/*`
		],
		['img']
	);

	// js 1.
	// this will watch for changes to the "main" app.js
	gulp.watch(
		[
			`${config.pathSrcJs}**/*`,
			`!${config.pathSrcJs}{libs,head}.js` // ignore changes to other js files
		],
		['js-hint', 'js-app']
	);

	// js 2.
	// this will only watch for changes relevant to the libs.js
	gulp.watch(
		[
			`${config.pathSrcSvg2js}**/*`,
			`${config.pathSrcJs}libs.js`
		],
		['js-libs']
	);

	// js 3.
	// this will watch for changes to the head.js
	gulp.watch(
		[
			`${config.pathSrcJs}head.js`
		],
		['js-head']
	);
}

gulp.task('watch', () => watch());
gulp.task('run-watch', ['default'], () => watch()); // same as running: $> gulp default watch
