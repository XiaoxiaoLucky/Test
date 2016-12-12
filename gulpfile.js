/*
author:Xiaoshun Zhao
 */
var del=require('del');
var gulp=require('gulp');
var uglify=require('gulp-uglify');
var mincss=require('gulp-clean-css');//压缩css
var inline=require('gulp-inline-source'); //资源内联 （主要是js，css，图片）
var include=require('gulp-include'); //资源内联（主要是html片段）
var sequence=require('gulp-sequence');//按照欧指定顺序执行任务
var useref=require('gulp-useref'); //合并文件
var gulpif=require('gulp-if'); //条件判断
var print=require('gulp-print'); //打印命中的文件
var connect=require('gulp-connect'); //本地服务器
var jshint=require('gulp-jshint');//js语法校验
var imagemin=require('gulp-imagemin');//图片

//清理构建目录
gulp.task('clean',function (cb) {
    del(['dist']).then(function () {
        cb()
    })
});
//css文件压缩
gulp.task('mincss',function () {
    return gulp.src('./src/css/*.css')
        .pipe(mincss())
        .pipe(gulp.dest('dist/css'))
});
//js文件压缩
gulp.task('minjs',function () {
    return gulp.src('./src/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

//资源嵌入
gulp.task('html', function () {
    return gulp.src('./src/*.html')
        .pipe(inline())//把js内联到html中
        .pipe(include())//把html片段内联到html主文件中
        .pipe(useref())//根据标记的块  合并js或者css
        .pipe(gulpif('*.js',uglify()))
        .pipe(gulpif('*.css',mincss()))
        .pipe(connect.reload()) //重新构建后自动刷新页面
        .pipe(gulp.dest('dist'));
});
//图片压缩
gulp.task('imagemin', function () {
    gulp.src('src/img/*.{png,jpg,gif,ico}')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});
//本地服务器  支持自动刷新页面
gulp.task('connect', function() {
    connect.server({
        root: './dist', //本地服务器的根目录路径
        port:8888,
        livereload: true
    });
});
//js代码校验
gulp.task('lint', function () {
    return gulp.src([
        'src/js/*',
        '*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
//sequence的返回函数只能运行一次 所以这里用function cb方式使用
gulp.task('watchlist',function (cb) {
    sequence('clean',['mincss','minjs','html','imagemin','lint'])(cb)
});

gulp.task('watch',function () {
    gulp.watch(['./src/**'],['watchlist']);
});

//中括号外面的是串行执行， 中括号里面的任务是并行执行。
gulp.task('default',function (cb) {
    sequence('clean',['mincss','minjs','html','imagemin','lint','connect'],'watch')(cb)
});





