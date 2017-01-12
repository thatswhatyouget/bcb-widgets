var gulp = require('gulp');
var electron = require('gulp-electron');
var packageJson = require('./package.json');
var del = require('del');
 
gulp.task('clean', function () {
    return del('app/'); 
});

gulp.task('electron', ['clean'], function() {
 
    gulp.src("")
    .pipe(electron({
        src: './app-src',
        packageJson: packageJson,
        release: './app',
        cache: './cache',
        version: 'v1.4.14',
        packaging: true,
        // token: 'abc123...',
        platforms: ['darwin-x64','win32-x64','linux-x64'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                icon: 'bcb.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'bcb.ico'
            }
        }
    }))
    .pipe(gulp.dest(""));
});