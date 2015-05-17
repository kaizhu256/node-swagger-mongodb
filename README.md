swagger-mongodb
===============
WORK IN PROGRESS
lightweight swagger-ui crud api backed by mongodb

[![NPM](https://img.shields.io/npm/v/swagger-mongodb.svg?style=flat-square)](https://www.npmjs.org/package/swagger-mongodb)



# live test-server
[![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.testExampleJs.slimerjs..png)](https://hrku01-swagger-mongodb-beta.herokuapp.com)



# build-status [![travis-ci.org build-status](https://api.travis-ci.org/kaizhu256/node-swagger-mongodb.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)

[![build commit status](https://kaizhu256.github.io/node-swagger-mongodb/build/build.badge.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)

| git-branch : | [master](https://github.com/kaizhu256/node-swagger-mongodb/tree/master) | [beta](https://github.com/kaizhu256/node-swagger-mongodb/tree/beta) | [alpha](https://github.com/kaizhu256/node-swagger-mongodb/tree/alpha)|
|--:|:--|:--|:--|
| test-server : | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-master.herokuapp.com) | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-beta.herokuapp.com) | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-alpha.herokuapp.com)|
| test-report : | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/test-report.html) | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/test-report.html) | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/test-report.html)|
| coverage : | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/coverage.html/node-swagger-mongodb/index.html) | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/coverage.html/node-swagger-mongodb/index.html) | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/coverage.html/node-swagger-mongodb/index.html)|
| build-artifacts : | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..master..travis-ci.org) | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..beta..travis-ci.org) | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..alpha..travis-ci.org)|

#### master branch
- stable branch
- HEAD should be tagged, npm-published package

#### beta branch
- stable branch
- HEAD should be latest, npm-published package

#### alpha branch
- unstable branch
- HEAD is arbitrary
- commit history may be rewritten



# quickstart web example
#### to run this example, follow the instruction in the script below
```
/*
example.js

this node script will serve a
lightweight swagger-ui crud api backed by mongodb

instruction
    1. save this script as example.js
    2. run the shell command:
          $ npm install swagger-mongodb && \
              npm_config_server_port=1337 node example.js
    3. open a browser to http://localhost:1337
    4. interact with the swagger-ui api
*/

/*jslint
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    stupid: true
*/

(function () {
    'use strict';
    // run node js-env code
    (function () {
        var local;
        // init local
        local = {};
        local.global = global;
        local.modeJs = 'node';
        try {
            local.swmgdb = require('swagger-mongodb');
        } catch (errorCaught) {
            local.swmgdb = require('./index.js');
        }
        local.utility2 = local.swmgdb.local.utility2;
        // init onReady
        local.utility2.onReadyInit();
        // import swmgdb.local
        Object.keys(local.swmgdb.local).forEach(function (key) {
            local[key] = local[key] || local.swmgdb.local[key];
        });
        // export local
        module.exports = local;
        // init assets
        local.utility2.cacheDict.assets['/'] = String() +
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
'        margin: 20px 0 20px 0;\n' +
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
'    <iframe \
height="512" \
src="/assets/swagger-ui.html" \
width="100%" \
></iframe>\n' +
'    <script src="/assets/utility2.js"></script>\n' +
'    <script src="/assets/swagger-ui.rollup.js"></script>\n' +
'    <script src="/assets/swagger-mongodb.js"></script>\n' +
'    <script src="/test/test.js"></script>\n' +
'    <script>\n' +
'    window.utility2 = window.utility2 || {};\n' +
'    window.utility2.envDict = {\n' +
'        npm_package_description: "{{envDict.npm_package_description}}",\n' +
'        npm_package_name: "{{envDict.npm_package_name}}",\n' +
'        npm_package_version: "{{envDict.npm_package_version}}"\n' +
'    };\n' +
'    document.querySelector("iframe").onload = function () {\n' +
'        var self;\n' +
'        self = this;\n' +
'        self.height = innerHeight - self.offsetTop - 20;\n' +
'        self.contentWindow.location.hash = location.hash;\n' +
'        self.contentWindow.onclick = function () {\n' +
'            setTimeout(function () {\n' +
'                location.hash = self.contentWindow.location.hash;\n' +
'            });\n' +
'        };\n' +
'    };\n' +
'    </script>\n' +
'    {{envDict.npm_config_html_body_extra}}\n' +
'</body>\n' +
'</html>\n' +
/* jslint-ignore-end */
            String();
        local.utility2.cacheDict.assets['/'] = local.utility2.stringFormat(
            local.utility2.cacheDict.assets['/'],
            { envDict: local.utility2.envDict },
            ''
        );
        local.utility2.cacheDict.assets['/assets/swagger-mongodb.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.swmgdb['/assets/swagger-mongodb.js'],
                local.swmgdb.__dirname + '/index.js',
                'swagger-mongodb'
            );
        local.utility2.cacheDict.assets['/test/test.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.fs.readFileSync(local.swmgdb.__dirname + '/test.js', 'utf8'),
                local.swmgdb.__dirname + '/test.js',
                'swagger-mongodb'
            );
        // init mongodb-client
        local.utility2.onReady.counter += 1;
        local.utility2.taskRunOrSubscribe({
            key: 'swagger-mongodb.mongodbConnect',
            onTask: function (onError) {
                local.mongodb.MongoClient.connect(
                    local.utility2.envDict.npm_config_mongodb_url ||
                        'mongodb://localhost:27017/test',
                    function (error, db) {
                            // validate no error occurred
                            local.utility2.assert(!error, error);
                            local.swmgdb.db = db;
                            onError();
                            local.utility2.onReady();
                        }
                );
            }
        });
        // init swmgdb
        local.swmgdb.apiUpdate({
            definitions: {
                CrudModel: {
                    _collectionName: 'SwmgdbCrudCollection',
                    _crudApi: true,
                    properties: {
                        fieldArray: { items: {}, type: 'array' },
                        fieldArraySubdoc: {
                            items: { $ref: '#/definitions/CrudModel' },
                            type: 'array'
                        },
                        fieldBoolean: { type: 'boolean' },
                        fieldInteger: { type: 'integer' },
                        fieldIntegerInt32: { format: 'int32', type: 'integer' },
                        fieldIntegerInt64: { format: 'int64', type: 'integer' },
                        fieldNumber: { type: 'number' },
                        fieldNumberDouble: { format: 'double', type: 'number' },
                        fieldNumberFloat: { format: 'float', type: 'number' },
                        fieldObject: { type: 'object' },
                        fieldObjectSubdoc: { $ref: '#/definitions/CrudModel' },
                        fieldRequired: {},
                        fieldString: { type: 'string' },
                        fieldStringByte: { format: 'byte', type: 'string' },
                        fieldStringDate: { format: 'date', type: 'string' },
                        fieldStringDatetime: { format: 'date-time', type: 'string' },
                        fieldStringEmail: { format: 'email', type: 'string' },
                        fieldStringJson: { format: 'json', type: 'string' },
                        fieldUndefined: {}
                    },
                    required: ['fieldRequired'],
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                },
                PetModel: {
                    _collectionName: 'SwmgdbPetCollection',
                    _crudApi: true,
                    properties: {},
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                },
                StoreModel: {
                    _collectionName: 'SwmgdbStoreCollection',
                    _crudApi: true,
                    properties: {},
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                },
                UserModel: {
                    _collectionName: 'SwmgdbUserCollection',
                    _crudApi: true,
                    properties: {
                        email: { format: 'email', type: 'string' },
                        passwordHash: { type: 'string' },
                        username: { type: 'string' }
                    },
                    required: ['passwordHash', 'username'],
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                }
            },
            tags: [
                { description: 'default mongodb crud api', name: 'CrudModel' },
                { description: 'Everything about your pets', name: 'PetModel' },
                { description: 'Access to Petstore orders', name: 'StoreModel' },
                { description: 'Operations about user', name: 'UserModel' }
            ]
        });
        // init middleware
        local.middleware = local.utility2.middlewareGroupCreate([
            local.utility2.middlewareInit,
            local.utility2.middlewareAssetsCached,
            local.swmgdb.middleware
        ]);
        // init middleware error-handler
        local.onMiddlewareError = local.swmgdb.onMiddlewareError;
        // run server-test
        local.utility2.testRunServer(local);
    }());
}());
```
#### output from shell
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.testExampleJs.png)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)

#### output from phantomjs-lite
[![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.testExampleJs.slimerjs..png)](https://hrku01-swagger-mongodb-beta.herokuapp.com)



# npm-dependencies
- utility2



# package-listing
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.gitLsTree.png)](https://github.com/kaizhu256/node-swagger-mongodb)



# package.json
```
{
    "_packageJson": true,
    "author": "kai zhu <kaizhu256@gmail.com>",
    "bin": { "swagger-mongodb": "index.js" },
    "dependencies": {
        "mongodb": "2.0.31",
        "swagger-ui-lite": "^2.1.0-M2-2015.5.6-a",
        "utility2": "2015.5.15-d"
    },
    "description": "lightweight swagger-ui crud api backed by mongodb",
    "devDependencies": {
        "phantomjs-lite": "^2015.4.26-c"
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
        "postinstall": "node_modules/.bin/utility2 shRun shReadmeExampleJsSave",
        "start": "npm_config_mode_auto_restart=1 \
node_modules/.bin/utility2 shRun node test.js",
        "test": "node_modules/.bin/utility2 shRun shReadmePackageJsonExport && \
node_modules/.bin/utility2 test test.js"
    },
    "version": "2015.5.17-b"
}
```



# todo
- remove bson compiled dependency
- cap test collections
- add formData swagger parameter type
- none



# change since 49d90223
- npm publish 2015.5.17-b
- add demo screen-capture
- none



# changelog of last 50 commits
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.gitLog.png)](https://github.com/kaizhu256/node-swagger-mongodb/commits)



# internal build-script
```
# build.sh
# this shell script will run the build for this package
shBuild() {
    # this function will run the main build
    # init env
    export npm_config_mode_slimerjs=1 || return $?
    . node_modules/.bin/utility2 && shInit || return $?

    # run npm-test on published package
    shRun shNpmTestPublished || return $?

    # test example js script
    export npm_config_timeout_exit=10000 || return $?
    MODE_BUILD=testExampleJs \
        shRunScreenCapture shReadmeTestJs example.js || return $?
    unset npm_config_timeout_exit || return $?

    # run npm-test
    MODE_BUILD=npmTest shRunScreenCapture npm test || return $?

    # if running legacy-node, then do not continue
    [ "$(node --version)" \< "v0.12" ] && return

    # deploy app to heroku
    shRun shHerokuDeploy hrku01-$npm_package_name-$CI_BRANCH || return $?

    # test deployed app to heroku
    if [ "$CI_BRANCH" = alpha ] ||
        [ "$CI_BRANCH" = beta ] ||
        [ "$CI_BRANCH" = master ]
    then
        TEST_URL="https://hrku01-$npm_package_name-$CI_BRANCH.herokuapp.com" \
            || return $?
        TEST_URL="$TEST_URL?modeTest=phantom&_testSecret={{_testSecret}}" || \
            return $?
        MODE_BUILD=herokuTest shRun shPhantomTest $TEST_URL || return $?
    fi

    # if number of commits > 1024, then squash older commits
    shRun shGitBackupAndSquashAndPush 1024 > /dev/null || return $?
}
shBuild

# save exit-code
EXIT_CODE=$?

shBuildCleanup() {
    # this function will cleanup build-artifacts in local build dir
    # create package-listing
    MODE_BUILD=gitLsTree shRunScreenCapture shGitLsTree || return $?
    # create recent changelog of last 50 commits
    MODE_BUILD=gitLog shRunScreenCapture git log -50 --pretty="%ai\u000a%B" || \
        return $?
}
shBuildCleanup || exit $?

shBuildGithubUploadCleanup() {
    # this function will cleanup build-artifacts in local gh-pages repo
    return
}

# if running legacy-node, then do not continue
[ "$(node --version)" \< "v0.12" ] && exit $EXIT_CODE

# upload build-artifacts to github,
# and if number of commits > 16, then squash older commits
COMMIT_LIMIT=16 shRun shBuildGithubUpload || exit $?

# exit with $EXIT_CODE
exit $EXIT_CODE
```
