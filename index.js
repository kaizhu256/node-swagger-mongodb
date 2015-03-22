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



        local.cms2.swaggerIdTo_Id = function (data) {
            /*
                this function will recursively convert the property id to _id
            */
            local.utility2.objectTraverse(data, function (element) {
                if (element && element.id) {
                    element._id = element._id || element.id;
                    delete element.id;
                }
            });
            return data;
        };

        local.cms2.swagger_IdToId = function (data) {
            /*
                this function will recursively convert the property _id to id
            */
            local.utility2.objectTraverse(data, function (element) {
                if (element && element._id) {
                    element.id = element.id || element._id;
                    delete element._id;
                }
            });
            return data;
        };

        local.cms2.swaggerPropertyValidate = function (options) {
            /*
               this function will validate options.value according to options.property
            */
            /*jslint bitwise: true, regexp: true*/
            var assert, property, tmp, value;
            assert = function (valid) {
                if (!valid) {
                    throw new Error(
                        'invalid ' + (property.format || property.type) + ' property '
                            + JSON.stringify(value)
                    );
                }
            };
            property = options.property;
            value = options.value;
            // JSON.parse value
            if (options.parse &&
                    value && typeof value === 'string' &&
                    options.type !== 'string') {
                try {
                    value = JSON.parse(value);
                } catch (errorCaught) {
                    assert(null);
                }
            }
            // validate undefined value
            if (value === null || value === undefined) {
                if (options.required) {
                    throw new Error('required property cannot be null or undefined');
                }
                return value;
            }
            // validate undefined property.type
            if (property.$ref && property.type === undefined) {
                return value;
            }
            // validate property.type
// https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#data-types
            switch (property.type) {
            case 'array':
                assert(Array.isArray(value));
                break;
            case 'boolean':
                assert(typeof value === 'boolean');
                break;
            case 'file':
                break;
            case 'integer':
                assert(typeof value === 'number' && (value | 0) === value);
                switch (property.format) {
                case 'int32':
                case 'int64':
                    break;
                }
                break;
            case 'number':
                assert(typeof value === 'number');
                switch (property.format) {
                case 'double':
                case 'float':
                    break;
                }
                break;
            case 'object':
                assert(typeof value === 'object');
                break;
            case 'string':
                assert(typeof value === 'string');
                switch (property.format) {
                // https://github.com/swagger-api/swagger-spec/issues/50
                case 'byte':
                    assert(!(/[^\n\r\+\/0-9\=A-Za-z]/).test(value));
                    break;
                case 'date':
                    tmp = new Date(value);
                    assert(tmp.getTime() && value === tmp.toISOString().slice(0, 10));
                    break;
                case 'date-time':
                    tmp = new Date(value);
                    assert(tmp.getTime() && value === tmp.toISOString());
                    break;
                case 'email':
                    assert(local.utility2.regexpEmailValidate.test(value));
                    break;
                }
                break;
            }
            return value;
        };
    }());
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        local.cms2.modelCreate = function (options) {
            /*
                this function will update swaggerJson.paths with options.paths
            */



/* jslint-indent-begin 12 */
/*jslint maxlen: 108, regexp: true*/
var model, pathMethod, tmp;
// init default crud
if (options._crudDefault) {
    local.utility2.objectSetOverride(options, {
        paths: {
            '/{{_modelName}}': {
                // get /model - modelFindByQuery
                get: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    operationId: '{{_modelNameCamelCase}}FindByQuery',
                    parameters: [{
                        description: 'mongodb query object',
                        in: 'path',
                        name: 'query',
                        required: true,
                        type: 'object'
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: '{{_modelNameCamelCase}}FindByQuery - get ' +
                        '{{_modelName}} object by id',
                    tags: ['{{_modelName}}']
                },
                // patch /model - modelCreateOrUpdate
                patch: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    operationId: '{{_modelNameCamelCase}}CreateOrUpdate',
                    parameters: [{
                        description: '{{_modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{_modelName}}' },
                        type: 'object'
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: '{{_modelNameCamelCase}}CreateOrUpdate - ' +
                        'create or update {{_modelName}} object',
                    tags: ['{{_modelName}}']
                },
                // post /model - modelCreate
                post: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    operationId: '{{_modelNameCamelCase}}Create',
                    parameters: [{
                        description: '{{_modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{_modelName}}' },
                        type: 'object'
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: '{{_modelNameCamelCase}}Create - ' +
                        'create or update {{_modelName}} object',
                    tags: ['{{_modelName}}']
                },
                // put /model - modelCreateOrReplace
                put: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    operationId: '{{_modelNameCamelCase}}CreateOrReplace',
                    parameters: [{
                        description: '{{_modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{_modelName}}' },
                        type: 'object'
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: '{{_modelNameCamelCase}}CreateOrReplace - ' +
                        'create or replace {{_modelName}} object',
                    tags: ['{{_modelName}}']
                }
            },
            '/{{_modelName}}/{id}': {
                // delete /model/id - modelDeleteById
                delete: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    operationId: '{{_modelNameCamelCase}}DeleteById',
                    parameters: [{
                        description: '{{_modelName}} id',
                        in: 'path',
                        name: 'id',
                        required: true,
                        type: 'string'
                    }],
                    summary: '{{_modelNameCamelCase}}DeleteById - delete ' +
                        '{{_modelName}} object by id',
                    tags: ['{{_modelName}}']
                },
                // get /model/id - modelGetById
                get: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    operationId: '{{_modelNameCamelCase}}GetById',
                    parameters: [{
                        description: '{{_modelName}} id',
                        in: 'path',
                        name: 'id',
                        required: true,
                        type: 'string'
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: '{{_modelNameCamelCase}}GetById - get ' +
                        '{{_modelName}} object by id',
                    tags: ['{{_modelName}}']
                }
            }
        }
    }, 2);
}
// init extra options properties
options.definitions['JsonApiResponseData{{_modelName}}'] = {
    allOf: [{ $ref: '#/definitions/JsonApiResponseData' }],
    properties: { data: { $ref: '#/definitions/User' } }
};
options._modelNameCamelCase = options._modelName[0].toLowerCase() + options._modelName.slice(1);
// recursively stringFormat options
local.utility2.objectTraverse(options, function (element) {
    Object.keys(element && typeof element === 'object'
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
// init modelDict
local.cms2.modelDict = local.cms2.modelDict || {};
// init model
model = local.cms2.modelDict[options._modelName] = options.definitions[options._modelName];
model.dataNormalize = function (data) {
    /*
        this function will normalize the data
    */
    data = data || {};
    // remove undefined properties from data
    Object.keys(data).forEach(function (key) {
        if (!(/^(?:_id|timeCreated|timeModified|type)$/).test(key) && !model.properties[key]) {
            delete data[key];
        }
    });
    return data;
};
model.dataValidate = function (data) {
    /*
        this function will normalize the data
    */
    data = data || {};
    Object.keys(model.properties).forEach(function (key) {
        try {
            local.cms2.swaggerPropertyValidate({
                property: model.properties[key],
                required: model.required && model.required.indexOf(key) >= 0,
                value: data[key]
            });
        } catch (errorCaught) {
            errorCaught.message = 'invalid ' + options._modelName + '.' + key + ' - ' +
                errorCaught.message;
            errorCaught.stack = errorCaught.message + '\n' + errorCaught.stack;
            throw errorCaught;
        }
    });
    return data;
};
// init model.collection
local.utility2.taskPoolCreateOrAddCallback(
    { key: 'cms2.mongodbConnect' },
    null,
    function () {
        model.collection = local.cms2.db.collection(options._collectionName);
    }
);
// update swaggerJson.paths
Object.keys(options.paths).forEach(function (path) {
    Object.keys(options.paths[path]).forEach(function (method) {
        pathMethod = options.paths[path][method];
        // init pathMethod.responses
        local.utility2.objectSetDefault(pathMethod, { responses: {
            200: {
                description: 'ok - ' +
                    'http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonApiResponseData' }
            },
            default: {
                description: 'internal server error - ' +
                    'http://jsonapi.org/format/#errors',
                schema: { $ref: '#/definitions/JsonApiResponseError' }
            }
        } }, 2);
        // init pathMethod._*
        Object.keys(options).forEach(function (key) {
            if (key[0] === '_' && typeof options[key] === 'string') {
                pathMethod[key] = pathMethod[key] || options[key];
            }
        });
        pathMethod._method = method;
        pathMethod._operationIdType =
            (pathMethod.operationId || '').replace(pathMethod._modelNameCamelCase, '');
        pathMethod._path = path;
        pathMethod._requestHandlerKey =
            method.toLowerCase() + ' ' + path.replace((/\{\S*?\}/), '');
        // init requestHandlerDict
        local.cms2.requestHandlerDict = local.cms2.requestHandlerDict || {};
        // save pathMethod to requestHandlerDict
        local.cms2.requestHandlerDict[pathMethod._requestHandlerKey] = pathMethod;
    });
});
// update swaggerJson
local.utility2.objectSetOverride(
    local.cms2.swaggerJson,
    // jsonCopy object to prevent side-effect
    local.utility2.objectTraverse(local.utility2.jsonCopy(options), function (element) {
        if (element && typeof element === 'object') {
            Object.keys(element).forEach(function (key) {
                // security - remove private underscored key
                if (key[0] === '_') {
                    delete element[key];
                }
            });
        }
    }),
    2
);
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
        case 1:
            // serve builtin assets
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
        case 2:
            if (request.urlParsed.pathnameNormalized
                    .indexOf(local.cms2.swaggerJson.basePath) === 0) {
                tmp = request.urlParsed.pathnameNormalized
                    .replace(local.cms2.swaggerJson.basePath, '');
                switch (tmp) {
                // serve swagger.json
                case '/swagger.json':
                    response.end(local.utility2.jsonStringifyOrdered(local.cms2.swaggerJson));
                    return;
                }
                // lookup swagger request-handler from requestHandlerDict
                while (true) {
                    swagger = swagger || local.cms2.requestHandlerDict[
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
            // save _requestHandler
            tmp = swagger._requestHandler;
            // jsonCopy object to prevent side-effect
            swagger = request.swagger = local.utility2.jsonCopy(swagger);
            global.swagger = swagger; //debugPrint
            // restore _requestHandler
            swagger._requestHandler = tmp;
            swagger.model = local.cms2.modelDict[swagger._modelName];
            swagger.responseData = { data: {} };
            onNext();
            break;
        case 3:
            onParallel = local.utility2.onParallel(onNext);
            onParallel.counter += 1;
            // init paramDict
            swagger.paramDict = {};
            // parse path param
            tmp = request.urlParsed.pathname
                .replace(local.cms2.swaggerJson.basePath, '')
                .split('/');
            swagger._path.split('/').forEach(function (key, ii) {
                if ((/^\{\S*?\}$/).test(key)) {
                    swagger.paramDict[key.slice(1, -1)] = tmp[ii];
                }
            });
            (swagger.parameters || []).forEach(function (param) {
                switch (param.in) {
                // parse body param
                case 'body':
                    onParallel.counter += 1;
                    local.utility2.streamReadAll(request, function (error, data) {
                        swagger.paramDict[param.name] = String(data);
                        onParallel(error);
                    });
                    break;
                // parse header param
                case 'header':
                    swagger.paramDict[param.name] = request.headers[param.name];
                    break;
                // parse query param
                case 'query':
                    swagger.paramDict[param.name] = request.urlParsed.query[param.name];
                    break;
                }
            });
            onParallel();
            break;
        case 4:
            // parse paramDict
            swagger.parameters.forEach(function (parameter) {
                swagger.paramDict[parameter.name] = local.cms2.swaggerPropertyValidate({
                    parse: true,
                    property: parameter,
                    value: swagger.paramDict[parameter.name]
                });
            });
            // rename id to _id
            local.cms2.swaggerIdTo_Id(swagger.paramDict);
            // http://jsonapi.org/format/#document-structure-resource-objects
            ['_id', 'type'].forEach(function (key) {
                swagger.responseData.data[key] = swagger.paramDict[key] ||
                    (swagger.paramDict.body && swagger.paramDict.body[key]);
            });
            swagger.responseData.data._id =
                swagger.responseData.data._id || local.utility2.uuidTime();
            // run serverMiddlewareHookBefore
            local.cms2.serverMiddlewareHookBefore(request, response, onNext);
            break;
        case 5:
            // run _requestHandler
            if (swagger._requestHandler) {
                swagger._requestHandler(request, response, onNext);
                return;
            }
            onNext();
            break;
        case 6:
            // run serverMiddlewareHookAfter
            local.cms2.serverMiddlewareHookAfter(request, response, onNext);
            break;
        case 7:
            // end response
            response.end(JSON.stringify(
                // rename _id to id
                local.cms2.swagger_IdToId(
                    // jsonCopy object to prevent side-effect
                    local.utility2.jsonCopy(swagger.responseData)
                ),
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
                    case 1:
                        // jslint-hack
                        local.utility2.nop(response);
                        swagger = request.swagger;
                        // init data
                        data = swagger.responseData.data;
                        switch (swagger._operationIdType) {
                        case 'CreateOrReplace':
                            // update data from body
                            local.utility2.objectSetOverride(data, swagger.paramDict.body);
                            onNext(null, data);
                            break;
                        case 'CreateOrUpdate':
                            // update data from body
                            local.utility2.objectSetOverride(data, swagger.paramDict.body);
                            // get previously saved data
                            swagger.model.collection.findOne({
                                _id: data._id
                            }, function (error, dataOld) {
                                // jslint-hack
                                local.utility2.nop(error);
                                swagger.dataOld = dataOld || {};
                                onNext(null, data);
                            });
                            break;
                        case 'DeleteById':
                            modeNext = NaN;
                            swagger.model.collection.removeOne({ _id: data._id }, onNext);
                            break;
                        case 'GetById':
                            modeNext = NaN;
                            swagger.model.collection.findOne({ _id: data._id }, onNext);
                            break;
                        default:
                            throw new Error('invalid crud operation - ' +
                                request.method + ' ' + request.url);
                        }
                        break;
                    case 2:
                        switch (swagger._operationIdType) {
                        case 'CreateOrReplace':
                            // init timeCreated
                            if (swagger.model.properties.timeCreated) {
                                data.timeCreated = new Date().toISOString();
                            }
                            onNext(null, data);
                            break;
                        case 'CreateOrUpdate':
                            // merge old data into new data
                            local.utility2.objectSetDefault(data, swagger.dataOld);
                            // init timeCreated
                            if (swagger.model.properties.timeCreated) {
                                data.timeCreated =
                                    swagger.dataOld.timeCreated || new Date().toISOString();
                            }
                            onNext(null, data);
                            break;
                        }
                        break;
                    case 3:
                        switch (swagger._operationIdType) {
                        case 'CreateOrReplace':
                        case 'CreateOrUpdate':
                            modeNext = NaN;
                            // init timeModified
                            if (swagger.model.properties.timeModified) {
                                data.timeModified = new Date().toISOString();
                            }
                            // validate data
                            swagger.model.dataValidate(
                                // normalize data
                                swagger.model.dataNormalize(data)
                            );
                            // upsert data
                            swagger.model.collection.update(
                                { _id: data._id },
                                data,
                                { upsert: true },
                                onNext
                            );
                            break;
                        }
                        break;
                    case 4:
                        onNext();
                        break;
                    default:
                        local.utility2.objectSetOverride(swagger.responseData, {
                            meta: data
                        }, 2);
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
            local.utility2.onErrorDefault(error);
            if (!error) {
                nextMiddleware();
                return;
            }
            local.utility2.serverRespondWriteHead(request, response, 500, {});
            // rename _id to id
            response.end(JSON.stringify(local.cms2.swagger_IdToId({ errors: [{
                _id: request.swagger.responseData._id,
                code: error.code,
                title: error.message,
                detail: error.stack,
                status: response.statusCode
            }] }), null, !process.env.npm_config_mode_production && 4));
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
        // init mongodb client
        local.utility2.onReady.counter += 1;
        local.utility2.taskPoolCreateOrAddCallback(
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
        local.cms2.swaggerJson = {
            basePath: local.utility2.envDict.npm_config_mode_api_prefix || '/api/v0.1',
            definitions: {
                Alias: {
                    properties: {
                        type: { type: 'string' },
                        value: { type: 'string' }
                    },
                    required: ['value']
                },
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
        local.cms2['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            .replace(
                'http://petstore.swagger.io/v2/swagger.json',
                local.cms2.swaggerJson.basePath + '/swagger.json'
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
        // init ContentDraft model
        local.cms2.modelCreate({
            _collectionName: 'ContentDraft',
            _createIndexList: [[{ 'aliasList.name': 1 }, { sparse: true, unique: true }]],
            _crudDefault: true,
            _modelName: 'ContentDraft',
            definitions: {
                // http://jsonapi.org/format/#document-structure-top-level
                JsonApiResponseDataContentDraft: {
                    allOf: [{ $ref: '#/definitions/JsonApiResponseData' }],
                    properties: { data: { $ref: '#/definitions/ContentDraft' } }
                },
                ContentDraft: {
                    properties: {
                        aliasList: {
                            items: { $ref: '#/definitions/Alias' },
                            type: 'array'
                        },
                        content: { type: 'string' },
                        summary: { type: 'string' },
                        timeCreated: { format: 'date-time', type: 'string' },
                        timeModified: { format: 'date-time', type: 'string' },
                        title: { type: 'string' }
                    }
                }
            },
            tags: [
                {
                    description: 'ContentDraft api',
                    name: 'ContentDraft'
                }
            ]
        });
        // init User model
        local.cms2.modelCreate({
            _collectionName: 'User',
            _createIndexList: [[{ 'aliasList.name': 1 }, { sparse: true, unique: true }]],
            _crudDefault: true,
            _modelName: 'User',
            definitions: {
                // http://jsonapi.org/format/#document-structure-top-level
                JsonApiResponseDataUser: {
                    allOf: [{ $ref: '#/definitions/JsonApiResponseData' }],
                    properties: { data: { $ref: '#/definitions/User' } }
                },
                User: {
                    properties: {
                        aliasList: {
                            items: { $ref: '#/definitions/Alias' },
                            type: 'array'
                        },
                        roleList: {
                            items: { type: 'string' },
                            type: 'array'
                        },
                        passwordHash: { type: 'string' },
                        passwordSalt: { type: 'string' },
                        timeCreated: { format: 'date-time', type: 'string' },
                        timeModified: { format: 'date-time', type: 'string' }
                    }
                }
            },
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
        local.utility2.taskPoolCreateOrAddCallback({
            key: 'utility2.onReady'
        }, null, function () {
            local.utility2.ajax({
                data: JSON.stringify({
                    id: 'foo'
                }),
                method: 'PATCH',
                url: '/api/v0.1/User'
            }, debugPrint);
            return;
        });
        break;
    }
}());
