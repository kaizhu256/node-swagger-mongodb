/*jslint
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    stupid: true
*/
(function (local) {
    'use strict';
    // run shared js-env code
    (function () {
        // init tests
        local.testCase_ajax_404 = function (onError) {
            /*
                this function will test ajax's 404 http statusCode handling behavior
            */
            // test '/test/undefined'
            local.utility2.ajax({
                url: '/test/undefined'
            }, function (error) {
                local.utility2.testTryCatch(function () {
                    // validate error occurred
                    local.utility2.assert(error instanceof Error, error);
                    // validate 404 http statusCode
                    local.utility2.assert(error.statusCode === 404, error.statusCode);
                    onError();
                }, onError);
            });
        };
    }());
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // init tests
        break;



    // run node js-env code
    case 'node':
        // init tests
        local.testCase_testPage_default = function (onError) {
            /*
                this function will test the test-page's
                default handling behavior
            */
            var onTaskEnd;
            onTaskEnd = local.utility2.onTaskEnd(onError);
            onTaskEnd.counter += 1;
            // test test-page handling behavior
            onTaskEnd.counter += 1;
            local.utility2.phantomTest({
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '?modeTest=phantom&' +
                    '_testSecret={{_testSecret}}&' +
                    'timeoutDefault=' + local.utility2.timeoutDefault
            }, onTaskEnd);
            onTaskEnd();
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // init swagger-ui
        local.utility2.onReady.counter += 1;
        window.swaggerUi = new window.SwaggerUi({
            dom_id: "swagger-ui-container",
            onComplete: function () {
                local.utility2.onReady();
            },
            supportedSubmitMethods: ['delete', 'get', 'patch', 'post', 'put'],
            url: '/api/v0.1/swagger.json'
        });
        window.swaggerUi.load();
        local.swagger_mongodb.api = window.swaggerUi.api;
        // export local
        window.local = local;
        // run test
        local.utility2.testRun(local);
        break;



    // run node js-env code
    case 'node':
        // export local
        global.local = local;
        // require modules
        local.fs = require('fs');
        local.mongodb = require('mongodb');
        local.path = require('path');
        local.swagger_tools = require('swagger-ui-lite/swagger-tools-standalone-min.js');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.url = require('url');
        local.utility2 = require('utility2');
        local.vm = require('vm');
        // init mongodb-client
        local.utility2.onReady.counter += 1;
        local.utility2.taskRunOrSubscribe({
            key: 'swagger-mongodb.mongodbConnect',
            onTask: function (onError) {
                local.mongodb.MongoClient.connect(
                    process.env.npm_config_mongodb_url || 'mongodb://localhost:27017/test',
                    function (error, db) {
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        local.swagger_mongodb.db = db;
                        onError();
                        local.utility2.onReady();
                    }
                );
            }
        });
        // init ContentDraft schema
        local.swagger_mongodb.schemaCreate({
            _collectionName: 'ContentDraft',
            _crudDefault: true,
            _schemaName: 'ContentDraft',
            definitions: {
                ContentDraft: {
                    properties: {
                        content: { type: 'string' },
                        summary: { type: 'string' },
                        title: { type: 'string' }
                    },
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                }
            },
            tags: [{ description: 'draft content', name: 'ContentDraft' }]
        });
        // init ContentPublish schema
        local.swagger_mongodb.schemaCreate({
            _collectionName: 'ContentPublish',
            _crudDefault: true,
            _schemaName: 'ContentPublish',
            definitions: {
                ContentPublish: {
                    'x-inheritList': [{ $ref: '#/definitions/ContentDraft' }]
                }
            },
            tags: [{ description: 'published content', name: 'ContentPublish' }]
        });
        // init assets
        local.utility2.cacheDict.assets['/'] =
            local.utility2.cacheDict.assets['/test/test.html'] =
            local.utility2.stringFormat(local.fs
                .readFileSync(__dirname + '/README.md', 'utf8')
                // extract html
                .replace((/[\S\s]+?(<!DOCTYPE html>[\S\s]+?<\/html>)[\S\s]+/), '$1')
                // parse '\' line-continuation
                .replace((/\\\n/g), '')
                // remove "\\n' +" and "'"
                .replace((/\\n' \+(\s*?)'/g), '$1'), { envDict: local.utility2.envDict }, '');
        local.utility2.cacheDict.assets['/assets/swagger-mongodb.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.swagger_mongodb['/assets/swagger-mongodb.js'],
                __dirname + '/index.js',
                'swagger-mongodb'
            );
        local.utility2.cacheDict.assets['/test/test.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.fs.readFileSync(__filename, 'utf8'),
                __filename,
                'swagger-mongodb'
            );
        // init middleware
        local.middleware = local.utility2.middlewareGroupCreate([
            local.utility2.middlewareInit,
            local.utility2.middlewareAssetsCached,
            function (request, response, nextMiddleware) {
                /*
                    this function will run the test-middleware
                */
                if (request.urlParsed.pathnameNormalized
                        .indexOf(local.swagger_mongodb.swaggerJson.basePath) === 0) {
                    local.utility2.serverRespondHeadSet(request, response, null, {
                        'Access-Control-Allow-Methods':
                            'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
                        // enable cors
                        // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
                        'Access-Control-Allow-Origin': '*',
                        // init content-type
                        'Content-Type': 'application/json; charset=UTF-8'
                    });
                }
                // default to nextMiddleware
                nextMiddleware();
            },
            local.swagger_mongodb.middleware
        ]);
        // init middleware error-handler
        local.onMiddlewareError = local.utility2.onMiddlewareError;
        // run server-test
        local.utility2.testRunServer(local);
        // init dir
        local.fs.readdirSync(__dirname).forEach(function (file) {
            file = __dirname + '/' + file;
            // if the file is modified, then restart the process
            local.utility2.onFileModifiedRestart(file);
            switch (local.path.extname(file)) {
            case '.js':
            case '.json':
                // jslint the file
                local.utility2.jslint_lite
                    .jslintAndPrint(local.fs.readFileSync(file, 'utf8'), file);
                break;
            }
        });
        // init repl debugger
        local.utility2.replStart();
        break;
    }
}((function () {
    'use strict';
    var local;



    // run shared js-env code
    (function () {
        // init local
        local = {};
        local.modeJs = (function () {
            try {
                return module.exports &&
                    typeof process.versions.node === 'string' &&
                    typeof require('http').createServer === 'function' &&
                    'node';
            } catch (errorCaughtNode) {
                return typeof navigator.userAgent === 'string' &&
                    typeof document.querySelector('body') === 'object' &&
                    'browser';
            }
        }());
        // init global
        local.global = local.modeJs === 'browser'
            ? window
            : global;
        // init utility2
        local.utility2 = local.modeJs === 'browser'
            ? window.utility2
            : require('utility2');
        // init swagger_mongodb
        local.swagger_mongodb = local.modeJs === 'browser'
            ? window.swagger_mongodb
            : require('./index.js');
    }());
    return local;
}())));
