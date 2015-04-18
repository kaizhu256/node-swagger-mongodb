cms2 [![NPM](https://img.shields.io/npm/v/cms2.svg?style=flat-square)](https://www.npmjs.org/package/cms2)
====
yet another content-management-system backed by mongodb with swagger-ui api



# build-status [![travis-ci.org build-status](https://api.travis-ci.org/kaizhu256/node-cms2.svg)](https://travis-ci.org/kaizhu256/node-cms2)

[![build commit status](https://kaizhu256.github.io/node-cms2/build/build.badge.svg)](https://travis-ci.org/kaizhu256/node-cms2)



# quickstart web example
#### to run this example, follow the instruction in the script below
```
/*
example.js

this node script will serve a web-page with interactive jslint

instruction
    1. save this script as example.js
    2. run the shell command:
          $ npm install cms2 && node example.js
    3. open a browser to http://localhost:1337
    4. edit or paste script in browser to jslint
*/

/*jslint
    browser: true,
    maxerr: 8,
    maxlen: 80,
    node: true,
    nomen: true,
    stupid: true
*/

(function () {
    'use strict';
    var local;
    // run node js-env code
    (function () {
        // init local
        local = {};
        // require modules
        local.cms2 = require('cms2');
        local.fs = require('fs');
        local.http = require('http');
        local.url = require('url');
        // init assets
        local['/'] = (String() +



/* jslint-ignore-begin */
'<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>\n' +
    '{{envDict.npm_package_name}} [{{envDict.npm_package_version}}]\n' +
    '</title>\n' +
    '<link rel="stylesheet" href="/assets/utility2.css">\n' +
    '<style>\n' +
    '* {\n' +
        'box-sizing: border-box;\n' +
    '}\n' +
    'body {\n' +
        'background-color: #fff;\n' +
        'font-family: Helvetical Neue, Helvetica, Arial, sans-serif;\n' +
    '}\n' +
    'body > div {\n' +
        'margin-top: 20px;\n' +
    '}\n' +
    '.testReportDiv {\n' +
        'display: none;\n' +
    '}\n' +
    '</style>\n' +
'</head>\n' +
'<body>\n' +
    '<div class="ajaxProgressDiv" style="display: none;">\n' +
    '<div class="ajaxProgressBarDiv ajaxProgressBarDivLoading">loading</div>\n' +
    '</div>\n' +
    '<h1>\n' +
        '{{envDict.npm_package_name}} [{{envDict.npm_package_version}}]\n' +
    '</h1>\n' +
    '<h3>{{envDict.npm_package_description}}</h3>\n' +
    '<div class="testReportDiv"></div>\n' +
    '<script src="/assets/utility2.js"></script>\n' +
    '<script src="/assets/cms2.js"></script>\n' +
    '<script src="/test/test.js"></script>\n' +
    '<script>\n' +
    'window.utility2 = window.utility2 || {};\n' +
    'window.utility2.envDict = {\n' +
        'npm_package_description: "{{envDict.npm_package_description}}",\n' +
        'npm_package_name: "{{envDict.npm_package_name}}",\n' +
        'npm_package_version: "{{envDict.npm_package_version}}"\n' +
    '};\n' +
    '</script>\n' +
'</body>\n' +
'</html>\n' +
/* jslint-ignore-end */



            String()).replace((/\{\{envDict\.\w+?\}\}/g), function (match0) {
            switch (match0) {
            case '{{envDict.npm_package_description}}':
                return 'this is an example module';
            case '{{envDict.npm_package_name}}':
                return 'example-module';
            case '{{envDict.npm_package_version}}':
                return '0.0.1';
            }
        });
        local['/assets/cms2.js'] =
            local.jslint_lite['/assets/cms2.js'];
        local['/assets/utility2.css'] =
            '';
        local['/assets/utility2.js'] =
            '';
        local['/test/test.js'] =
            '';
        // create server
        local.server = local.http.createServer(function (request, response) {
            switch (local.url.parse(request.url).pathname) {
            // serve assets
            case '/':
            case '/assets/cms2.js':
            case '/assets/utility2.css':
            case '/assets/utility2.js':
            case '/test/test.js':
                response.end(local[local.url.parse(request.url).pathname]);
                break;
            // default to 404 Not Found
            default:
                response.statusCode = 404;
                response.end('404 Not Found');
            }
        });
        // start server
        local.serverPort = 1337;
        console.log('server starting on port ' + local.serverPort);
        local.server.listen(local.serverPort, function () {
            // this internal build-code will screen-capture the server
            // and then exit
            if (process.env.MODE_BUILD === 'testExampleJs') {
                console.log('server stopping on port ' + local.serverPort);
                require(
                    process.env.npm_config_dir_utility2 + '/index.js'
                ).phantomScreenCapture({
                    url: 'http://localhost:' + local.serverPort
                }, process.exit);
            }
        });
    }());
}());
```
#### output from shell
[![screen-capture](https://kaizhu256.github.io/node-cms2/build/screen-capture.testExampleJs.png)](https://travis-ci.org/kaizhu256/node-cms2)



# quickstart command-line example
#### to run this example, follow the instruction in the script below
```
# example.sh

# this shell script will
    # npm install cms2
    # create foo.js
    # create bar.css
    # jslint foo.js and bar.css

# instruction
    # 1. copy and paste this entire shell script into a console and press enter
    # 2. view jslint in console

shExampleSh() {
    # npm install cms2
    npm install cms2 || return $?

    # create foo.js
    printf "console.log('hello');" > foo.js || return $?

    # create bar.css
    printf "body { margin: 0px; }" > bar.css || return $?

    # jslint foo.js and bar.css
    node_modules/.bin/cms2 foo.js bar.css || :
}
shExampleSh
```
#### output from shell
[![screen-capture](https://kaizhu256.github.io/node-cms2/build/screen-capture.testExampleSh.png)](https://travis-ci.org/kaizhu256/node-cms2)



## npm-dependencies
- none



# package-listing
[![screen-capture](https://kaizhu256.github.io/node-cms2/build/screen-capture.gitLsTree.png)](https://github.com/kaizhu256/node-cms2)



# package.json
```
{
    "_packageJson": true,
    "author": "kai zhu <kaizhu256@gmail.com>",
    "bin": { "cms2": "index.js" },
    "dependencies": {
        "mongodb": "2.0.27",
        "swagger-ui-lite": "2.1.8-M1-2015-03-29-a",
        "utility2": "2015.4.18-b"
    },
    "description": "yet another lightweight content-management-system \
backed by mongodb with swagger-ui api",
    "devDependencies": {
        "phantomjs-lite": "2015.4.18-a"
    },
    "engines": { "node": ">=0.10 <=0.12" },
    "keywords": [
        "browser",
        "cms",
        "mongo", "mongodb",
        "utility2",
        "swagger", "swagger-ui",
        "web"
    ],
    "license": "MIT",
    "name": "cms2",
    "os": ["darwin", "linux"],
    "repository" : {
        "type" : "git",
        "url" : "https://github.com/kaizhu256/node-cms2.git"
    },
    "scripts": {
        "build-ci": "node_modules/.bin/utility2 shRun shReadmeBuild",
        "start": "npm_config_mode_auto_restart=1 \
node_modules/.bin/utility2 shRun node test.js",
        "test": "node_modules/.bin/utility2 shRun shReadmePackageJsonExport && \
node_modules/.bin/utility2 test test.js"
    },
    "version": "2015.3.24-11"
}
```



# todo
- add formData swagger parameter type
- none



# changelog of last 50 commits
[![screen-capture](https://kaizhu256.github.io/node-cms2/build/screen-capture.gitLog.png)](https://github.com/kaizhu256/node-cms2/commits)



# internal build-script
```
# build.sh
# this shell script will run the build for this package
shBuild() {
    # init env
    export npm_config_mode_slimerjs=1 || return $?
    . node_modules/.bin/utility2 && shInit || return $?

    #!! # run npm-test on published package
    #!! shRun shNpmTestPublished || return $?

    #!! # test example js script
    #!! MODE_BUILD=testExampleJs \
        #!! shRunScreenCapture shReadmeTestJs example.js || return $?
    #!! # copy phantomjs screen-capture to $npm_config_dir_build
    #!! cp /tmp/app/tmp/build/screen-capture.*.png $npm_config_dir_build || \
        #!! return $?

    #!! # test example shell script
    #!! MODE_BUILD=testExampleSh \
        #!! shRunScreenCapture shReadmeTestSh example.sh || return $?

    # run npm-test
    MODE_BUILD=npmTest shRunScreenCapture npm test || return $?

    # do not continue if running legacy node
    [ "$(node --version)" \< "v0.12" ] && return

    # if number of commits > 1024, then squash older commits
    shRun shGitBackupAndSquashAndPush 1024 > /dev/null || return $?
}
shBuild

# save exit-code
EXIT_CODE=$?

# do not continue if running legacy node
[ "$(node --version)" \< "v0.12" ] && exit $EXIT_CODE

shBuildCleanup() {
    # this function will cleanup build-artifacts in local build dir
    # init env
    . node_modules/.bin/utility2 && shInit || return $?
    # create package-listing
    MODE_BUILD=gitLsTree shRunScreenCapture shGitLsTree || return $?
    # create recent changelog of last 50 commits
    MODE_BUILD=gitLog shRunScreenCapture git log -50 --pretty="%ai\u000a%B" || \
        return $?
    # add black border around phantomjs screen-capture
    shBuildPrint phantomScreenCapture \
        "add black border around phantomjs screen-capture" || return $?
    local FILE_LIST="$(ls \
        $npm_config_dir_build/screen-capture.*.phantomjs*.png \
        $npm_config_dir_build/screen-capture.*.slimerjs*.png \
        2>/dev/null)" || return $?
    if [ "$FILE_LIST" ] && (mogrify --version > /dev/null 2>&1)
    then
        printf "$FILE_LIST" | \
            xargs -n 1 mogrify -frame 1 -mattecolor black || return $?
    fi
}
shBuildCleanup || exit $?

shBuildGithubUploadCleanup() {
    # this function will cleanup build-artifacts in local gh-pages repo
    return
}

# upload build-artifacts to github,
# and if number of commits > 16, then squash older commits
COMMIT_LIMIT=16 shRun shBuildGithubUpload || exit $?

# exit with $EXIT_CODE
exit $EXIT_CODE
```
