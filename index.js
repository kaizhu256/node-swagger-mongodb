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



    // run node js-env code
    case 'node':
        local.cms2.modelDataNormalize = function (modelName, data) {
            /*
                this function will normalize the data of the given model
            */
            var model;
            data = data || {};
            model = local.cms2.swaggerJson.definitions[modelName];
            // remove undefined properties from data
            Object.keys(data).forEach(function (key) {
                if (!(/^(?:_id|timeCreated|timeModified|type)$/).test(key) &&
                        !model.properties[key]) {
                    delete data[key];
                }
            });
            return data;
        };

        local.cms2.swaggerModelUpdate = function (options) {
            /*
                this function will update swaggerJson.paths with options.paths
            */



/* jslint-indent-begin 12 */
/*jslint maxlen: 108, regexp: true*/
var model, pathMethod, requestHandler, tmp;
// init default crud
if (options.crudDefault) {
    local.utility2.objectSetOverride(options, {
        paths: {
            '/{{modelName}}': {
                // post /model - modelCreateOrReplace
                post: {
                    operationId: '{{modelNameCameCase}}CreateOrReplace',
                    parameters: [{
                        description: '{{modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{modelName}}' }
                    }],
                    requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{modelName}}' }
                        }
                    },
                    summary: '{{modelNameCameCase}}CreateOrReplace - ' +
                        'create or replace {{modelName}} object',
                    tags: ['{{modelName}}']
                },
                // put /model - modelCreateOrUpdate
                put: {
                    operationId: '{{modelNameCameCase}}CreateOrUpdate',
                    parameters: [{
                        description: '{{modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{modelName}}' }
                    }],
                    requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{modelName}}' }
                        }
                    },
                    summary: '{{modelNameCameCase}}CreateOrUpdate - ' +
                        'create or update {{modelName}} object',
                    tags: ['{{modelName}}']
                }
            },
            '/{{modelName}}/{id}': {
                // delete /model/id - modelDeleteById
                delete: {
                    operationId: '{{modelNameCameCase}}DeleteById',
                    parameters: [{
                        description: '{{modelName}} id',
                        in: 'path',
                        name: 'id',
                        required: true
                    }],
                    requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    summary: '{{modelNameCameCase}}DeleteById - delete ' +
                        '{{modelName}} object by id',
                    tags: ['{{modelName}}']
                },
                // get /model/id - modelGetById
                get: {
                    operationId: '{{modelNameCameCase}}GetById',
                    parameters: [{
                        description: '{{modelName}} id',
                        in: 'path',
                        name: 'id',
                        required: true
                    }],
                    requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{modelName}}' }
                        }
                    },
                    summary: '{{modelNameCameCase}}GetById - get ' +
                        '{{modelName}} object by id',
                    tags: ['{{modelName}}']
                }
            }
        }
    }, 2);
}
// init extra options properties
options.definitions['JsonApiResponseData{{modelName}}'] = {
    allOf: [{ $ref: '#/definitions/JsonApiResponseData' }],
    properties: {
        data: { $ref: '#/definitions/User' }
    }
};
options.modelNameCameCase = options.modelName[0].toLowerCase() + options.modelName.slice(1);
// recursively stringFormat options
local.utility2.objectTraverse(options, function (element) {
    Object.keys(typeof element === 'object'
        ? element
        : {}).forEach(function (key) {
        tmp = element[key];
        delete element[key];
        key = local.utility2.stringFormat(key, options);
        element[key] = tmp;
        if (typeof element[key] === 'string') {
            element[key] = local.utility2.stringFormat(element[key], options);
        }
    });
});
// update swaggerJson.definitions
local.utility2.objectSetOverride(local.cms2.swaggerJson, {
    // json-copy object to prevent side-effects
    definitions: local.utility2.jsonCopy(options.definitions)
}, 2);
// init modelDict
local.cms2.modelDict = local.cms2.modelDict || {};
// init model
model = local.cms2.modelDict[options.modelName] = options.definitions[options.modelName];
// init cacheDict.collectionDict
local.cms2.cacheDict.collectionDict = local.cms2.cacheDict.collectionDict || {};
// init model.collection
local.utility2.taskCreateOrSubscribe(
    { key: 'cms2.mongodbConnect' },
    null,
    function () {
        model.collection =
            local.cms2.cacheDict.collectionDict[options.collectionName] =
            local.cms2.cacheDict.collectionDict[options.collectionName] ||
            local.cms2.db.collection(options.collectionName);
    }
);
// update swaggerJson.paths
Object.keys(options.paths).forEach(function (path) {
    Object.keys(options.paths[path]).forEach(function (method) {
        pathMethod = options.paths[path][method];
        // init pathMethod.responses
        local.utility2.objectSetDefault(pathMethod, { responses: {
            200: {
                description: '200 ok - ' +
                    'http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonApiResponseData' }
            },
            500: {
                description: '500 internal server error - ' +
                    'http://jsonapi.org/format/#errors',
                schema: { $ref: '#/definitions/JsonApiResponseError' }
            }
        } }, 2);
        // security - remove requestHandler in swaggerJson.paths[path][method]
        requestHandler = pathMethod.requestHandler;
        delete pathMethod.requestHandler;
        // init swaggerJson.paths[path]
        local.cms2.swaggerJson.paths[path] = local.cms2.swaggerJson.paths[path] || {};
        // save pathMethod to swaggerJson.paths[path]
        local.cms2.swaggerJson.paths[path][method] =
            // json-copy object to prevent side-effects
            local.utility2.jsonCopy(pathMethod);
        // init internal properties
        Object.keys(options).forEach(function (key) {
            if (typeof options[key] === 'string') {
                pathMethod[key] = pathMethod[key] || options[key];
            }
        });
        pathMethod.method = method;
        pathMethod.path = path;
        // security - restore requestHandler in pathMethod
        pathMethod.requestHandler = requestHandler;
        pathMethod.requestHandlerKey =
            method.toLowerCase() + ' ' + path.replace((/\{\S*?\}/), '');
        // init swaggerRequestHandlerDict
        local.cms2.swaggerRequestHandlerDict = local.cms2.swaggerRequestHandlerDict || {};
        // save pathMethod to swaggerRequestHandlerDict
        local.cms2.swaggerRequestHandlerDict[pathMethod.requestHandlerKey] = pathMethod;
    });
});
/* jslint-indent-end */



        };

        local.cms2.serverMiddleware = function (request, response, nextMiddleware) {
            /*
                this function will run the main swagger middleware
            */



/* jslint-indent-begin 12 */
/*jslint maxlen: 108, regexp: true*/
var modeNext, onNext, onParallel, swagger, tmp;
modeNext = 0;
onNext = function (error) {
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
        // lookup and init swagger-object from swaggerRequestHandlerDict
        case 2:
            if (request.urlParsed.pathnameNormalized
                    .indexOf(local.cms2.swaggerBasePath) === 0) {
                tmp = request.urlParsed.pathnameNormalized
                    .replace(local.cms2.swaggerBasePath, '');
                switch (tmp) {
                // serve swagger.json
                case '/swagger.json':
                    response.end(local.utility2.jsonStringifyOrdered(local.cms2.swaggerJson));
                    return;
                }
                // lookup swagger request-handler
                while (true) {
                    swagger = swagger || local.cms2.swaggerRequestHandlerDict[
                        request.method.toLowerCase() + ' ' + tmp
                    ];
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
            // json-copy object to prevent side-effects
            swagger = request.swagger = local.utility2.jsonCopy(swagger);
            swagger.model = local.cms2.modelDict[swagger.modelName];
            swagger.responseData = {};
            onNext();
            break;
        // init swagger.parameterDict
        case 3:
            onParallel = local.utility2.onParallel(onNext);
            onParallel.counter += 1;
            swagger.parameterDict = { id: local.utility2.uuidTime(), type: null };
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
                    swagger.parameterDict[parameter.name] = request.headers[parameter.name];
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
        // run serverMiddlewareHookBefore
        case 4:
            local.cms2.serverMiddlewareHookBefore(request, response, onNext);
            break;
        // run swagger.requestHandler
        case 5:
            tmp = local.cms2.swaggerRequestHandlerDict[swagger.requestHandlerKey];
            if (tmp && tmp.requestHandler) {
                tmp.requestHandler(request, response, onNext);
                return;
            }
            onNext();
            break;
        // run serverMiddlewareHookAfter
        case 6:
            // jsonify data
            swagger.responseData = local.utility2.jsonCopy(swagger.responseData);
            local.cms2.serverMiddlewareHookAfter(request, response, onNext);
            break;
        // end response
        case 7:
            // rename _id -> id
            local.utility2.objectTraverse(swagger.responseData, function (element) {
                if (element && element._id) {
                    element.id = element.id || element._id;
                    element._id = undefined;
                }
            });
            // normalize responseData
            local.utility2.objectSetDefault(
                swagger.responseData,
                // http://jsonapi.org/format/#document-structure-resource-objects
                { data: { id: swagger.parameterDict.id, type: swagger.parameterDict.type } },
                2
            );
            response.end(JSON.stringify(
                swagger.responseData,
                null,
                !process.env.npm_config_mode_production && 4
            ));
            break;
        default:
            local.cms2.serverMiddlewareError(error, request, response, nextMiddleware);
        }
    } catch (errorCaught) {
        local.cms2.serverMiddlewareError(errorCaught, request, response, nextMiddleware);
    }
};
onNext();
/* jslint-indent-end */



        };

        local.cms2.serverMiddlewareCrudDefault = function (request, response, nextMiddleware) {
            /*
                this function will run default swagger crud operations
            */
            var modeNext, onNext, swagger;
            modeNext = 0;
            onNext = function (error, data) {
                try {
                    modeNext = error instanceof Error
                        ? NaN
                        : modeNext + 1;
                    switch (modeNext) {
                    // serve builtin assets
                    case 1:
                        // jslint-hack
                        local.utility2.nop(response);
                        swagger = request.swagger;
                        swagger.crudDefaultKey =
                            swagger.requestHandlerKey
                                .replace((/\/\S+?\//), '//')
                                .replace((/[\w]+?$/), '');
                        switch (swagger.crudDefaultKey) {
                        case 'get //':
                            swagger.model.collection
                                .findOne({ _id: swagger.parameterDict.id }, onNext);
                            break;
                        case 'delete //':
                            modeNext = NaN;
                            swagger.model.collection
                                .removeOne({ _id: swagger.parameterDict.id }, onNext);
                            break;
                        case 'post /':
                        case 'put /':
                            local.utility2.onErrorJsonParse(onNext)(
                                null,
                                swagger.parameterDict.body
                            );
                            break;
                        default:
                            throw new Error('invalid crud operation - ' +
                                request.method + ' ' + request.url);
                        }
                        break;
                    case 2:
                        // normalize data
                        data = local.cms2.modelDataNormalize(swagger.modelName, data);
                        switch (swagger.crudDefaultKey) {
                        case 'post /':
                            modeNext = NaN;
                            swagger.responseData.data = data;
                            // init _id
                            data._id = swagger.parameterDict.id =
                                data._id || data.id || local.utility2.uuidTime();
                            delete data.id;
                            // init timeCreated and timeModified
                            data.timeCreated = data.timeModified = new Date().toISOString();
                            swagger.model.collection.update(
                                { _id: data._id },
                                data,
                                { upsert: true },
                                onNext
                            );
                            break;
                        default:
                            modeNext = NaN;
                            onNext(null, data);
                        }
                        break;
                    default:
                        swagger.responseData.data = swagger.responseData.data || data;
                        nextMiddleware(error);
                    }
                } catch (errorCaught) {
                    nextMiddleware(errorCaught);
                }
            };
            onNext();
        };

        local.cms2.serverMiddlewareError = function (error, request, response, nextMiddleware) {
            /*
                this function will handle errors according to http://jsonapi.org/format/#errors
            */
            // jslint-hack
            local.utility2.nop(request);
            local.utility2.onErrorDefault(error);
            if (!error) {
                nextMiddleware();
                return;
            }
            if (!response.headersSent) {
                response.statusCode = response.statusCode || 500;
            }
            response.end(JSON.stringify({ errors: [{
                code: error.code,
                id: local.utility2.uuidTime(),
                title: error.message,
                detail: error.stack,
                status: response.statusCode
            }] }, null, !process.env.npm_config_mode_production && 4));
        };

        local.cms2.serverMiddlewareHookAfter = function (request, response, nextMiddleware) {
            /*
               this function will run any hooks before the main swagger api
            */
            // jslint-hack
            local.utility2.nop(request, response);
            nextMiddleware();
        };

        local.cms2.serverMiddlewareHookBefore = function (request, response, nextMiddleware) {
            /*
               this function will run any hooks after the main swagger api
            */
            // jslint-hack
            local.utility2.nop(request, response);
            nextMiddleware();
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export cms2
        window.cms2 = local.cms2;
        break;



    // run node js-env code
    case 'node':
        // export cms2
        module.exports = local.cms2;
        // require modules
        local.fs = require('fs');
        local.mongodb = require('mongodb');
        local.path = require('path');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.url = require('url');
        local.utility2 = require('utility2');
        // init cacheDict
        local.cms2.cacheDict = {};
        // init mongodb client
        local.utility2.onReady.counter += 1;
        local.utility2.taskCreateOrSubscribe(
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
            definitions: {
                // http://jsonapi.org/format/#errors
                JsonApiError: {
                    properties: {
                        code: { type: 'string' },
                        detail: { type: 'string' },
                        href: { type: 'string' },
                        id: { type: 'string' },
                        links: {
                            items: { type: 'string' },
                            type: 'array'
                        },
                        paths: {
                            items: { type: 'string' },
                            type: 'array'
                        },
                        status: { type: 'integer' },
                        title: { type: 'string' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-meta
                JsonApiMeta: {
                    properties: {}
                },
                // http://jsonapi.org/format/#document-structure-meta
                JsonApiLinks: {
                    properties: {
                        self: { type: 'string' },
                        related: { type: 'string' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-resource-objects
                JsonApiResource: {
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-top-level
                JsonApiResponseData: {
                    properties: {
                        data: { $ref: '#/definitions/JsonApiResource' },
                        included: {
                            items: { $ref: '#/definitions/JsonApiResource' },
                            type: 'array'
                        },
                        links: { $ref: '#/definitions/JsonApiLinks' },
                        meta: { $ref: '#/definitions/JsonApiMeta' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-top-level
                JsonApiResponseError: {
                    properties: {
                        errors: {
                            items: { $ref: '#/definitions/JsonApiError' },
                            type: 'array'
                        }
                    }
                }
            },
            info: {
                description: 'demo of cms2 swagger-api',
                title: 'cms2 api',
                version: '0.1'
            },
            paths: {},
            swagger: '2.0'
        };
        local.cms2.swaggerModelUpdate({
            crudDefault: true,
            collectionName: 'User',
            createIndexList: [[{
                'usernameList.name': 1
            }, {
                unique: true
            }]],
            definitions: {
                // http://jsonapi.org/format/#document-structure-top-level
                JsonApiResponseDataUser: {
                    allOf: [{ $ref: '#/definitions/JsonApiResponseData' }],
                    properties: {
                        data: { $ref: '#/definitions/User' }
                    }
                },
                User: {
                    properties: {
                        timeCreated: { type: 'date-time' },
                        timeModified: { type: 'date-time' },
                        roleList: {
                            items: { type: 'string' },
                            type: 'array'
                        },
                        passwordHash: { type: 'string' },
                        passwordSalt: { type: 'string' },
                        usernameList: {
                            items: { $ref: '#/definitions/Username' },
                            type: 'array'
                        }
                    }
                },
                Username: {
                    properties: {
                        name: { type: 'string' },
                        type: { type: 'string' }
                    }
                }
            },
            modelName: 'User',
            paths: {
                '/User/login': {
                    // post /User/login - userLogin
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
                        summary: 'userLogin - login new session',
                        tags: ['User']
                    }
                },
                '/User/logout': {
                    // delete /User/logout - userLogout
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
                        tags: ['User']
                    }
                }
            },
            tags: [
                {
                    description: 'User api',
                    name: 'User'
                }
            ]
        });
        break;
    }
}());
