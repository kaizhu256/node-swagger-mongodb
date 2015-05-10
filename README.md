swagger-mongodb [![NPM](https://img.shields.io/npm/v/swagger-mongodb.svg?style=flat-square)](https://www.npmjs.org/package/swagger-mongodb)
===============
yet another content-management-system backed by mongodb with swagger-ui api



# build-status [![travis-ci.org build-status](https://api.travis-ci.org/kaizhu256/node-swagger-mongodb.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)

[![build commit status](https://kaizhu256.github.io/node-swagger-mongodb/build/build.badge.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)



| git-branch : | [alpha](https://github.com/kaizhu256/node-swagger-mongodb/tree/alpha) | [beta](https://github.com/kaizhu256/node-swagger-mongodb/tree/beta) | [master](https://github.com/kaizhu256/node-swagger-mongodb/tree/master)|
|--:|:--|:--|:--|
| test-server : | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-alpha.herokuapp.com) | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-beta.herokuapp.com) | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-master.herokuapp.com)|
| test-report : | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/test-report.html) | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/test-report.html) | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/test-report.html)|
| coverage : | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/coverage.html/node-swagger-mongodb/index.html) | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/coverage.html/node-swagger-mongodb/index.html) | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/coverage.html/node-swagger-mongodb/index.html)|
| build-artifacts : | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..alpha..travis-ci.org) | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..beta..travis-ci.org) | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..master..travis-ci.org)|



# quickstart web example
#### to run this example, follow the instruction in the script below
```
/*
example.js

this node script will serve a web-page with interactive jslint

instruction
    1. save this script as example.js
    2. run the shell command:
          $ npm install swagger-mongodb && node example.js
    3. open a browser to http://localhost:1337
    4. interact with the swagger-ui api
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
        local.swagger_mongodb = require('swagger-mongodb');
        local.fs = require('fs');
        local.http = require('http');
        local.url = require('url');
        // init assets
        local['/'] = (String() +



/* jslint-ignore-begin */
'<!DOCTYPE html>\n' +
'<html>\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <title>\n' +
'    {{envDict.npm_package_name}} [{{envDict.npm_package_version}}]\n' +
'    </title>\n' +
'    <link rel="stylesheet" href="/assets/utility2.css">\n' +
'    <style>\n' +
'    * {\n' +
'        box-sizing: border-box;\n' +
'    }\n' +
'    body {\n' +
'        background-color: #fff;\n' +
'        font-family: Helvetical Neue, Helvetica, Arial, sans-serif;\n' +
'    }\n' +
'    body > div {\n' +
'        margin-top: 20px;\n' +
'    }\n' +
'    .testReportDiv {\n' +
'        display: none;\n' +
'    }\n' +
'    </style>\n' +
'    {{envDict.npm_config_html_head_extra}}\n' +
'</head>\n' +
'<body>\n' +
'    <div class="ajaxProgressDiv" style="display: none;">\n' +
'    <div class="ajaxProgressBarDiv ajaxProgressBarDivLoading" \
>loading</div>\n' +
'    </div>\n' +
'    <h1 \
>{{envDict.npm_package_name}} [{{envDict.npm_package_version}}]</h1>\n' +
'    <h3>{{envDict.npm_package_description}}</h3>\n' +
'    <div class="testReportDiv"></div>\n' +
'    <div id="swagger-ui-container" style="display: none;"></div>\n' +
'    <script src="/assets/utility2.js"></script>\n' +
'    <script src='/assets/swagger-ui.rollup.js'></script>\n' +
'    <script src="/assets/swagger-mongodb.js"></script>\n' +
'    <script src="/test/test.js"></script>\n' +
'    <script>\n' +
'    window.utility2 = window.utility2 || {};\n' +
'    window.utility2.envDict = {\n' +
'        npm_package_description: "{{envDict.npm_package_description}}",\n' +
'        npm_package_name: "{{envDict.npm_package_name}}",\n' +
'        npm_package_version: "{{envDict.npm_package_version}}"\n' +
'    };\n' +
'    </script>\n' +
'    {{envDict.npm_config_html_body_extra}}\n' +
'    <br>\n' +
'    <iframe \
height="512" \
onload="this.height=screen.height;" \
src="/assets/swagger-ui.html" \
width="100%" \
></iframe>\n' +
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
            default:
                return '';
            }
        });
        local['/assets/swagger-mongodb.js'] =
            local.utility2.jslint_lite['/assets/swagger-mongodb.js'];
        local['/assets/utility2.css'] = '';
        local['/assets/utility2.js'] = '';
        local['/test/test.js'] = '';
        // create server
        local.server = local.http.createServer(function (request, response) {
            switch (local.url.parse(request.url).pathname) {
            // serve assets
            case '/':
            case '/assets/swagger-mongodb.js':
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
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.testExampleJs.png)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)



# npm-dependencies
- none



# package-listing
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.gitLsTree.png)](https://github.com/kaizhu256/node-swagger-mongodb)



# package.json
```
{
    "_packageJson": true,
    "author": "kai zhu <kaizhu256@gmail.com>",
    "bin": { "swagger-mongodb": "index.js" },
    "dependencies": {
        "mongodb": "2.0.27",
        "swagger-ui-lite": "2.1.0-M2-2015.5.6-a",
        "utility2": "2015.5.6-c"
    },
    "description": "yet another lightweight content-management-system \
backed by mongodb with swagger-ui api",
    "devDependencies": {
        "phantomjs-lite": "2015.4.26-c"
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
    "name": "swagger-mongodb",
    "os": ["darwin", "linux"],
    "repository" : {
        "type" : "git",
        "url" : "https://github.com/kaizhu256/node-swagger-mongodb.git"
    },
    "scripts": {
        "build-ci": "node_modules/.bin/utility2 shRun shReadmeBuild",
        "start": "npm_config_mode_auto_restart=1 \
node_modules/.bin/utility2 shRun node test.js",
        "test": "node_modules/.bin/utility2 shRun shReadmePackageJsonExport && \
node_modules/.bin/utility2 test test.js"
    },
    "version": "2015.5.10-a"
}
```



# todo
- add formData swagger parameter type
- none



# change since 41df2bbb
- migrating cms2 to node-swagger-mongodb
- add swagger param parsing to middleware
- working local crud
- add middlewareAssetsCache and centralize assets into local.utility2.cacheDict.assets
- npm publish 2015.5.10-a
- add swagger param parsing to middleware
- revampt to 100% use swagger-tools
- none



# changelog of last 50 commits
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.gitLog.png)](https://github.com/kaizhu256/node-swagger-mongodb/commits)



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

    # run npm-test
    MODE_BUILD=npmTest shRunScreenCapture npm test || return $?

    # if running legacy-node, then do not continue
    [ "$(node --version)" \< "v0.12" ] && return

    # if number of commits > 1024, then squash older commits
    shRun shGitBackupAndSquashAndPush 1024 > /dev/null || return $?
}
shBuild

# save exit-code
EXIT_CODE=$?

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

# if running legacy-node, then do not continue
[ "$(node --version)" \< "v0.12" ] && exit $EXIT_CODE

shGitSquashShift() {
    # this function will squash $RANGE to the first commit
    local BRANCH || return $?
    local RANGE || return $?
    BRANCH=$(git rev-parse --abbrev-ref HEAD) || return $?
    RANGE=$1 || return $?
    git checkout -q HEAD~$RANGE || return $?
    git reset -q $(git rev-list --max-parents=0 HEAD) || return $?
    git add . || return $?
    git commit -m squash || :
    git cherry-pick -X theirs --allow-empty --strategy=recursive $BRANCH~$RANGE..$BRANCH || \
        return $?
    git push -f . HEAD:$BRANCH || return $?
    git checkout $BRANCH || return $?
}

# upload build-artifacts to github,
# and if number of commits > 16, then squash older commits
COMMIT_LIMIT=16 shRun shBuildGithubUpload || exit $?

# exit with $EXIT_CODE
exit $EXIT_CODE
```
