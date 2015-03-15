/*jslint
    browser: true,
    maxerr: 4,
    maxlen: 96,
    node: true,
    nomen: true,
    stupid: true
*/
(function () {
    'use strict';
    var local;
    // init local
    local = {};
    local.cms2 = { local: local };



    // run shared js-env code
    (function () {
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
        // init utility2
        local.utility2 = local.modeJs === 'browser'
            ? window.utility2
            : require('utility2');
        // init env
        local.cms2.swaggerBasePath =
            local.utility2.envDict.npm_config_mode_api_prefix || '/api/v0.1';
    }());
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export cms2
        window.cms2 = local.cms2;
        break;



    // run node js-env code
    case 'node':
        local.cms2.swaggerRequestHandlerCrudDefault = function (
            request,
            response,
            nextMiddleware
        ) {
            /*
                this function will run the default swagger crud request-handler
            */
            // jslint-hack
            local.utility2.nop(request, response);
            nextMiddleware();
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error) {



/* jslint-indent-begin 16 */
/*jslint maxlen: 112, regexp: true*/
try {
    modeNext = error instanceof Error
        ? NaN
        : modeNext + 1;
    switch (modeNext) {
    case 1:
        onNext();
        break;
    default:
        nextMiddleware(error);
    }
} catch (errorCaught) {
    nextMiddleware(errorCaught);
}
/* jslint-indent-end */



            };
            onNext();
        };
        local.cms2.swaggerUpdate = function (options) {
            /*
                this function will update swaggerJson with options
            */
            // update swaggerJson with options
            local.utility2.objectOverride(
                local.cms2.swaggerJson,
                // json-copy to prevent side-effect propagation
                local.utility2.jsonCopy(options),
                2
            );
            // init swaggerRequestHandlerDict
            local.cms2.swaggerRequestHandlerDict = local.cms2.swaggerRequestHandlerDict || {};
            Object.keys(options.paths || {}).forEach(function (path) {
                Object.keys(options.paths[path] || {}).forEach(function (method) {
                    var pathMethod;
                    // delete meta data from swaggerJson
                    delete local.cms2.swaggerJson.paths[path][method].meta;
                    pathMethod = options.paths[path][method];
                    pathMethod.method = method;
                    pathMethod.path = path;
                    pathMethod.requestHandlerKey = method.toUpperCase() + ' ' +
                        path.replace((/\{\S*?\}/g), '');
                    local.cms2.swaggerRequestHandlerDict[pathMethod.requestHandlerKey] =
                        pathMethod;
                });
            });
        };
        local.cms2.swaggerUpdateCrudDefault = function (modelName) {
            /*
                this function will update swaggerJson with default crud for modelName
            */
            var options;
            options = { paths: {} };
            options.paths['/' + modelName] = {
                put: {
                    operationId: modelName + 'Upsert',
                    parameters: [{
                        description: modelName + ' object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: {
                            $ref: '#/definitions/' + modelName
                        }
                    }],
                    summary: modelName + 'Upsert - upsert ' + modelName + ' object',
                    tags: [modelName]
                }
            };
            options.paths['/' + modelName + '/{_id}'] = {
                delete: {
                    operationId: modelName + 'DeleteById',
                    parameters: [{
                        description: modelName + ' id',
                        in: 'path',
                        name: '_id',
                        required: true
                    }],
                    summary: modelName + 'DeleteById - delete ' + modelName + ' object by id',
                    tags: [modelName]
                },
                get: {
                    operationId: modelName + 'GetById',
                    parameters: [{
                        description: modelName + ' id',
                        in: 'path',
                        name: '_id',
                        required: true
                    }],
                    summary: modelName + 'GetById - get ' + modelName + ' object by id',
                    tags: [modelName]
                }
            };
            local.cms2.swaggerUpdate(options);
            Object.keys(options.paths).forEach(function (path) {
                Object.keys(options.paths[path]).forEach(function (method) {
                    local.cms2.swaggerRequestHandlerDict[
                        options.paths[path][method].requestHandlerKey
                    ].requestHandler = local.cms2.swaggerRequestHandlerCrudDefault;
                });
            });

        };
        // export cms2
        module.exports = local.cms2;
        // require modules
        local.fs = require('fs');
        local.mongodb = require('mongodb');
        local.path = require('path');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.url = require('url');
        local.utility2 = require('utility2');
        // init assets
        local.cms2['/assets/cms2.js'] = local.fs
            .readFileSync(__filename, 'utf8');
        local.cms2['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            .replace(
                'http://petstore.swagger.io/v2/swagger.json',
                local.cms2.swaggerBasePath + '/swagger.json'
            );
        local.cms2['/assets/swagger-ui.rollup.css'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.rollup.css',
                'utf8'
            );
        local.cms2['/assets/swagger-ui.rollup.js'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.rollup.js',
                'utf8'
            );
        local.cms2['/assets/swagger-ui.explorer_icons.png'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.explorer_icons.png');
        local.cms2['/assets/swagger-ui.logo_small.png'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.logo_small.png');
        local.cms2['/assets/swagger-ui.throbber.gif'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.throbber.gif');
        local.cms2.swaggerJson = {
            basePath: local.cms2.swaggerBasePath,
            info: {
                description: 'demo of cms2 swagger-api',
                title: 'cms2 api'
            },
            swagger: '2.0'
        };
        // init serverMiddleware
        local.cms2.serverMiddleware = function (request, response, nextMiddleware) {
            var modeNext, onNext, onParallel, swagger, tmp;
            modeNext = 0;
            onNext = function (error) {



/* jslint-indent-begin 16 */
/*jslint maxlen: 112, regexp: true*/
try {
    modeNext = error instanceof Error
        ? NaN
        : modeNext + 1;
    switch (modeNext) {
    // serve builtin assets
    case 1:
        switch (request.urlParsed.pathnameNormalized) {
        case '/assets/utility2.css':
        case '/assets/utility2.js':
            response.end(local.utility2[request.urlParsed.pathnameNormalized]);
            return;
        case '/assets/cms2.js':
        case '/assets/swagger-ui.html':
        case '/assets/swagger-ui.rollup.css':
        case '/assets/swagger-ui.rollup.js':
        case '/assets/swagger-ui.explorer_icons.png':
        case '/assets/swagger-ui.logo_small.png':
        case '/assets/swagger-ui.throbber.gif':
            response.end(local.cms2[request.urlParsed.pathnameNormalized]);
            return;
        default:
            onNext();
        }
        break;
    // init swagger-api
    case 2:
        if (request.urlParsed.pathnameNormalized.indexOf(local.cms2.swaggerBasePath) === 0) {
            tmp = request.urlParsed.pathnameNormalized.replace(local.cms2.swaggerBasePath, '');
            switch (tmp) {
            // serve swagger.json
            case '/swagger.json':
                response.end(local.utility2.jsonStringifyOrdered(local.cms2.swaggerJson));
                return;
            }
            // lookup swagger request-handler
            while (true) {
                swagger = request.swagger = request.swagger || local.cms2
                        .swaggerRequestHandlerDict[request.method.toUpperCase() + ' ' + tmp];
                if (swagger || !(/[^\/]/).test(tmp)) {
                    break;
                }
                tmp = tmp.replace((/[^\/]+(\/*)$/), '$1');
            }
        }
        // if 404, then run nextMiddleware
        if (!swagger) {
            nextMiddleware();
            return;
        }
        // json-copy to prevent side-effect propagation
        swagger = local.utility2.jsonCopy(swagger);
        swagger.requestHandler = request.swagger.requestHandler;
        request.swagger = swagger;
        onNext();
        break;
    // init swagger.parameterDict
    case 3:
        onParallel = local.utility2.onParallel(onNext);
        onParallel.counter += 1;
        swagger.parameterDict = {};
        // parse path parameter
        tmp = request.urlParsed.pathname.replace(local.cms2.swaggerBasePath, '').split('/');
        swagger.path.split('/').forEach(function (key, ii) {
            if ((/^\{\S*?\}$/).test(key)) {
                swagger.parameterDict[key.slice(1, -1)] = tmp[ii];
            }
        });
        (swagger.parameters || []).forEach(function (parameter) {
            switch (parameter.in) {
            // parse body parameter
            case 'body':
                onParallel.counter += 1;
                local.utility2.streamReadAll(request, function (error, data) {
                    swagger.parameterDict[parameter.name] = String(data);
                    onParallel(error);
                });
                break;
            // parse header parameter
            case 'header':
                swagger.parameterDict[parameter.name] =
                    request.headers[parameter.name];
                break;
            // parse query parameter
            case 'query':
                swagger.parameterDict[parameter.name] =
                    request.urlParsed.query[parameter.name];
                break;
            }
        });
        onParallel();
        break;
    // run serverMiddlewareSwaggerHookBefore
    case 4:
        response.responseJson = {};
        local.cms2.serverMiddlewareSwaggerHookBefore(request, response, onNext);
        break;
    // run swagger-api
    case 5:
        debugPrint(swagger);
        tmp = local.cms2.swaggerRequestHandlerDict[swagger.requestHandlerKey];
        if (tmp && tmp.requestHandler) {
            tmp.requestHandler(request, response, onNext);
            return;
        }
        onNext();
        break;
    // run serverMiddlewareSwaggerHookAfter
    case 6:
        local.cms2.serverMiddlewareSwaggerHookAfter(request, response, onNext);
        break;
    // end response
    case 7:
        response.end(JSON.stringify(response.responseJson));
        break;
    default:
        local.cms2.serverMiddlewareError(error, request, response, nextMiddleware);
    }
} catch (errorCaught) {
    local.cms2.serverMiddlewareError(errorCaught, request, response, nextMiddleware);
}
/* jslint-indent-end */



            };
            onNext();
        };
        local.cms2.serverMiddlewareSwaggerHookAfter = function (
            request,
            response,
            nextMiddleware
        ) {
            /*
               this function will run any hooks before the main swagger api
            */
            // jslint-hack
            local.utility2.nop(request, response);
            nextMiddleware();
        };
        local.cms2.serverMiddlewareSwaggerHookBefore = function (
            request,
            response,
            nextMiddleware
        ) {
            /*
               this function will run any hooks after the main swagger api
            */
            // jslint-hack
            local.utility2.nop(request, response);
            nextMiddleware();
        };
        local.cms2.serverMiddlewareError = function (error, request, response, nextMiddleware) {
            /*
                this function handles errors according to http://jsonapi.org/format/#errors
            */
            // jslint-hack
            local.utility2.nop(request);
            if (!error) {
                nextMiddleware();
                return;
            }
            if (!response.headersSent) {
                response.statusCode = response.statusCode || 500;
            }
            response.end(JSON.stringify({ errors: [{
                code: error.code,
                message: error.message,
                stack: error.stack,
                status: 500
            }] }));
        };
        // init mongodb client
        local.utility2.onReady.counter += 1;
        local.mongodb.MongoClient.connect(
            process.env.npm_config_mongodb_url || 'mongodb://localhost:27017/test',
            function (error, db) {
                // validate no error occurred
                local.utility2.assert(!error, error);
                local.cms2.db = db;
                local.utility2.onReady();
            }
        );
        // init user collection
        local.cms2.swaggerUpdate({
            definitions: {
                user: {
                    properties: {
                        roleList: {
                            items: { type: 'string' },
                            type: 'array'
                        },
                        passwordHash: { type: 'string' },
                        passwordSalt: { type: 'string' },
                        usernameList: {
                            items: { type: 'username' },
                            type: 'array'
                        }
                    }
                },
                username: {
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string' }
                    }
                }
            },
            paths: {
                '/user/login': {
                    post: {
                        operationId: 'userLogin',
                        parameters: [{
                            description: 'login username',
                            in: 'query',
                            name: 'username',
                            required: true,
                            type: 'string'
                        }, {
                            description: 'login password in cleartext',
                            in: 'query',
                            name: 'password',
                            required: true,
                            type: 'string'
                        }],
                        summary: 'userLogin login new session',
                        tags: ['user']
                    }
                },
                '/user/logout': {
                    delete: {
                        operationId: 'userLogout',
                        parameters: [{
                            description: 'logout sessionId',
                            in: 'query',
                            name: 'sessionId',
                            required: true,
                            type: 'string'
                        }],
                        summary: 'userLogout - logout current session',
                        tags: ['user']
                    }
                }
            },
            tags: [
                {
                    description: 'user api',
                    name: 'user'
                }
            ]
        });
        local.cms2.swaggerUpdateCrudDefault('user');
        break;
    }
}());
