/*jslint
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    stupid: true,
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

        local.testCase_modelContentDraft_crud = function (onError) {
            /*
                this function will test model ContentDraft's crud handling behavior
            */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error) {
                try {



/* jslint-indent-begin 20 */
/*jslint maxlen: 116, regexp: true*/
modeNext = error instanceof Error
    ? NaN
    : modeNext + 1;
switch (modeNext) {
case 1:
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
    break;
/* jslint-indent-end */



                    }
                } catch (errorCaught) {
                    onError(errorCaught);
                }
            };
            onNext();
        };

        local.testValidateCrudDelete = function (collection, id, onError) {
            /*
                this function will crud-delete the collection/id and validate the deletion
            */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error) {
                try {
                    modeNext = error instanceof Error ? -1 : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // crud-delete model
                        local.utility2.ajax({
                            method: 'DELETE',
                            url: '/api/v0.1/' + collection + '/deleteByIdOne/' + id
                        }, onNext);
                        break;
                    case 2:
                        // crud check model exists
                        local.utility2.ajax({
                            method: 'GET',
                            url: '/api/v0.1/' + collection + '/getByIdOne/' + id
                        }, onNext);
                        break;
                    //!! case 3:
                        //!! data = JSON.parse(data);
                        //!! // validate content does not exist
                        //!! local.utility2.assert(data && data.exists === false, url);
                        //!! // crud check model exists
                        //!! local.utility2.ajax({
                            //!! method: 'GET',
                            //!! url: '/api/v0.1/' + collection + '/getByIdOne/' + id
                        //!! }, local.utility2.testValidateError(onNext));
                        //!! break;
                    default:
                        onError(error);
                    }
                } catch (errorCaught) {
                    onError(errorCaught);
                }
            };
            onNext();
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
        // init mongodb client
        local.utility2.onReady.counter += 1;
        local.utility2.taskCacheCreateOrAddCallback(
            { key: 'cms2.mongodbConnect' },
            function (onError) {
                local.mongodb.MongoClient.connect(
                    process.env.npm_config_mongodb_url || 'mongodb://localhost:27017/test',
                    function (error, db) {
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        local.cms2.db = db;
                        onError();
                        local.utility2.onReady();
                    }
                );
            },
            local.utility2.nop
        );
        // init ContentDraft model
        local.cms2.modelCreate({
            _collectionName: 'ContentDraft',
            _crudDefault: true,
            _modelName: 'ContentDraft',
            _tags: [{ description: 'draft content', name: 'ContentDraft' }],
            definitions: {
                ContentDraft: {
                    properties: {
                        content: { type: 'string' },
                        summary: { type: 'string' },
                        title: { type: 'string' }
                    },
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                }
            }
        });
        // init ContentHistory model
        local.cms2.modelCreate({
            _collectionName: 'ContentHistory',
            _crudDefault: true,
            _modelName: 'ContentHistory',
            _tags: [{ description: 'history of published content', name: 'ContentHistory' }],
            definitions: {
                ContentHistory: {
                    properties: {
                        _contentId: { type: 'string' },
                        _version: { type: 'integer' }
                    },
                    'x-inheritList': [{ $ref: '#/definitions/ContentDraft' }]
                }
            }
        });
        // init ContentPublish model
        local.cms2.modelCreate({
            _collectionName: 'ContentPublish',
            _crudDefault: true,
            _modelName: 'ContentPublish',
            _tags: [{ description: 'published content', name: 'ContentPublish' }],
            definitions: {
                ContentPublish: {
                    'x-inheritList': [{ $ref: '#/definitions/ContentDraft' }]
                }
            }
        });
        // init User model
        local.cms2.modelCreate({
            _collectionName: 'User',
            _createIndexList: [
                [{ "email": 1 }, { "dropDups": true, "sparse": true, "unique": true }],
                [{ "username": 1 }, { "dropDups": true, "sparse": true, "unique": true }]
            ],
            _crudDefault: true,
            _modelName: 'User',
            _tags: [{ description: 'user api', name: 'User' }],
            definitions: {
                User: {
                    properties: {
                        email: { default: 'john@example.com', type: 'string' },
                        roleList: {
                            items: { default: 'guest', type: 'string' },
                            type: 'array'
                        },
                        passwordHash: {
                            default: '00000000-0000-0000-0000-000000000000',
                            type: 'string'
                        },
                        passwordSalt: {
                            default: '00000000-0000-0000-0000-000000000000',
                            type: 'string'
                        },
                        username: { default: 'john', type: 'string' }
                    },
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                }
            },
            paths: {
                '/User/login': {
                    put: {
                        parameters: [{
                            description: 'login username',
                            in: 'header',
                            name: 'username',
                            required: true,
                            type: 'string'
                        }, {
                            description: 'login password',
                            in: 'header',
                            name: 'password',
                            required: true,
                            type: 'string'
                        }],
                        summary: 'login user to new session',
                        tags: ['User']
                    }
                },
                '/User/logout': {
                    delete: {
                        parameters: [{
                            description: 'logout sessionId',
                            in: 'query',
                            name: 'sessionId',
                            required: true,
                            type: 'string'
                        }],
                        summary: 'logout user from existing session',
                        tags: ['User']
                    }
                }
            }
        });
        local.utility2.taskCacheCreateOrAddCallback({
            key: 'utility2.onReady'
        }, null, function () {
            // validate swaggerJson
            local.swagger_tools.v2
                .validate(local.cms2.swaggerJson, function (error, result) {
                    if (error) {
                        local.utility2.onErrorDefault(error);
                        return;
                    }
                    local._debugSwaggerJsonError = result;
                    (result && result.errors && result.errors.length
                        ? result.errors
                        : result && result.warnings && result.warning.lengh
                        ? result.warnings
                        : []).slice(0, 4).forEach(function (element) {
                        console.error('swagger schema - ' + element.code + ' - ' +
                            element.message + ' - ' + JSON.stringify(element.path));
                    });
                });
            // init api
            local.cms2.api = new local.cms2.SwaggerClient({
                url: 'http://localhost:' + local.utility2.envDict.npm_config_server_port
            });
            local.cms2.api.buildFromSpec(local.cms2.swaggerJson);
            (function () {
                local.cms2.api.ContentDraft.getByIdOne({ id2: 1 }, debugPrint,
                function () {
                    debugPrint(arguments.length + '\n' + JSON.stringify(arguments, null, 4));
                }, debugPrint);
            }());
        });
        // init assets
        local['/'] = local.utility2.stringFormat(local.fs
            .readFileSync(__dirname + '/README.md', 'utf8')
            .replace((/[\S\s]+?(<!DOCTYPE html>[\S\s]+?<\/html>)[\S\s]+/), '$1')
            // parse '\' line-continuation
            .replace((/\\\n/g), '')
            .replace((/\\n' \+(\s*?)'/g), '$1'), { envDict: local.utility2.envDict }, '');
        local['/assets/cms2.js'] = local.istanbul_lite.instrumentInPackage(
            local.cms2['/assets/cms2.js'],
            __dirname + '/index.js',
            'cms2'
        );
        local['/test/test.js'] = local.istanbul_lite.instrumentInPackage(
            local.fs.readFileSync(__filename, 'utf8'),
            __filename,
            'cms2'
        );
        // init middleware
        local.middleware = local.utility2.middlewareGroupCreate([
            local.utility2.middlewareInit,
            function (request, response, nextMiddleware) {
                /*
                    this function will run the test-middleware
                */
                if (request.urlParsed.pathnameNormalized
                        .indexOf(local.cms2.swaggerJson.basePath) === 0) {
                    local.utility2.serverRespondSetHead(request, response, null, {
                        'Access-Control-Allow-Methods':
                            'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
                        // enable cors
                        // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
                        'Access-Control-Allow-Origin': '*',
                        // init content-type
                        'Content-Type': 'application/json; charset=UTF-8'
                    });
                }
                switch (request.urlParsed.pathnameNormalized) {
                // serve assets
                case '/':
                case '/test/test.js':
                    response.end(local[request.urlParsed.pathnameNormalized]);
                    break;
                // default to nextMiddleware
                default:
                    nextMiddleware();
                }
            }
        ].concat([local.cms2.middleware]));
        // init middleware error-handler
        local.onMiddlewareError = local.utility2.onMiddlewareError;
        // run server-test
        local.utility2.testRunServer(local);
        // init dir
        local.fs.readdirSync(__dirname).forEach(function (file) {
            file = __dirname + '/' + file;
            switch (local.path.extname(file)) {
            case '.js':
            case '.json':
                // jslint the file
                local.jslint_lite.jslintAndPrint(local.fs.readFileSync(file, 'utf8'), file);
                break;
            }
            // if the file is modified, then restart the process
            local.utility2.onFileModifiedRestart(file);
        });
        // init repl debugger
        local.utility2.replStart({});
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
        // init istanbul_lite
        local.istanbul_lite = local.utility2.local.istanbul_lite;
        // init jslint_lite
        local.jslint_lite = local.utility2.local.jslint_lite;
        // init cms2
        local.cms2 = local.modeJs === 'browser'
            ? window.cms2
            : require('./index.js');
    }());
    return local;
}())));
