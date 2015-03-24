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

        local.cms2.modelDereference = function ($ref) {
            /*
                this function will try to dereference the model from $ref
            */
            try {
                return $ref && local.cms2.swaggerJson
                    .definitions[(/^\#\/definitions\/(\w+)$/).exec($ref)[1]];
            } catch (ignore) {
            }
        };

        local.cms2.modelIdTo_Id = function (data) {
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

        local.cms2.model_IdToId = function (data) {
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

        local.cms2.modelNormalize = function (options) {
            /*
                this function will normalize options.data according to options.model
            */
            var data;
            data = options.data || {};
            // init _timeCreated
            data._timeCreated = options.dataPrevious._timeCreated || new Date().toISOString();
            // init _timeModified
            data._timeModified = new Date().toISOString();
            // normalize _aliasList
            local.cms2.modelNormalizeAliasList(options);
        };

        local.cms2.modelNormalizeAliasList = function (options) {
            var aliasDict;
            aliasDict = {};
            (options.data._aliasList || []).forEach(function (element) {
                aliasDict[element && element.key] = element;
            });
            aliasDict[options.data._id] =
                aliasDict[options.data._id] || { key: options.data._id };
            options.data._aliasList = Object.keys(aliasDict).map(function (key) {
                return aliasDict[key];
            });
        };

        local.cms2.modelValidate = function (options) {
            /*
               this function will validate options.data according to options.model
            */
            var data, model;
            data = options.data;
            model = options.model || {};
            Object.keys(model.properties || {}).forEach(function (key) {
                try {
                    local.cms2.modelValidateProperty({
                        data: data[key],
                        key: key,
                        property: model.properties[key],
                        required: model.required && model.required.indexOf(key) >= 0
                    });
                } catch (errorCaught) {
                    errorCaught.message = 'invalid ' + options.key + '.' + key + ' - ' +
                        errorCaught.message;
                    errorCaught.stack = errorCaught.message + '\n' + errorCaught.stack;
                    throw errorCaught;
                }
            });
            // recurse - validate data according to model.allOf
            (model.allOf || []).forEach(function (element) {
                local.cms2.modelValidate({
                    data: options.data,
                    key: element.$ref,
                    model: local.cms2.modelDereference(element.$ref)
                });
            });
            return data;
        };

        local.cms2.modelValidateProperty = function (options) {
            /*
               this function will validate options.data according to options.property
            */
            /*jslint bitwise: true, regexp: true*/
            var assert, data, property, tmp;
            assert = function (valid) {
                if (!valid) {
                    throw new Error(
                        'invalid ' +
                            (property.$ref || property.format || property.type) +
                            ' property - ' + JSON.stringify(data)
                    );
                }
            };
            property = options.property || {};
            data = options.data;
            // JSON.parse data
            if (options.parse &&
                    data && typeof data === 'string' &&
                    property.type !== 'file' && property.type !== 'string') {
                try {
                    data = JSON.parse(data);
                } catch (errorCaught) {
                    assert(null);
                }
            }
            // validate undefined data
            if (data === null || data === undefined) {
                if (options.required) {
                    throw new Error('required property cannot be null or undefined');
                }
                return data;
            }
            // validate property.type
// https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#data-types
            switch (property.type) {
            case 'array':
                assert(Array.isArray(data));
                // recurse - validate elements in list
                data.forEach(function (element) {
                    local.cms2.modelValidateProperty({
                        key: options.key,
                        property: property.items,
                        data: element
                    });
                });
                break;
            case 'boolean':
                assert(typeof data === 'boolean');
                break;
            case 'file':
                break;
            case 'integer':
                assert(typeof data === 'number' && (data | 0) === data);
                switch (property.format) {
                case 'int32':
                case 'int64':
                    break;
                }
                break;
            case 'number':
                assert(typeof data === 'number');
                switch (property.format) {
                case 'double':
                case 'float':
                    break;
                }
                break;
            case 'object':
                assert(typeof data === 'object');
                break;
            case 'string':
                assert(typeof data === 'string');
                switch (property.format) {
                // https://github.com/swagger-api/swagger-spec/issues/50
                case 'byte':
                    assert(!(/[^\n\r\+\/0-9\=A-Za-z]/).test(data));
                    break;
                case 'date':
                    tmp = new Date(data);
                    assert(tmp.getTime() && data === tmp.toISOString().slice(0, 10));
                    break;
                case 'date-time':
                    tmp = new Date(data);
                    assert(tmp.getTime() && data === tmp.toISOString());
                    break;
                case 'email':
                    assert(local.utility2.regexpEmailValidate.test(data));
                    break;
                }
                break;
            }
            // recurse - validate model according to property.$ref
            local.cms2.modelValidate({
                data: data,
                model: local.cms2.modelDereference(property.$ref),
                key: options.key
            });
            return data;
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
            '/{{_modelName}}/create': {
                post: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    parameters: [{
                        description: '{{_modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{_modelName}}' }
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: 'create {{_modelName}} object',
                    tags: ['{{_modelName}}']
                }
            },
            '/{{_modelName}}/createOrReplace': {
                put: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    parameters: [{
                        description: '{{_modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{_modelName}}' }
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: 'create or replace {{_modelName}} object',
                    tags: ['{{_modelName}}']
                }
            },
            '/{{_modelName}}/createOrUpdate': {
                patch: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    parameters: [{
                        description: '{{_modelName}} object',
                        in: 'body',
                        name: 'body',
                        required: true,
                        schema: { $ref: '#/definitions/{{_modelName}}' }
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: 'create or update {{_modelName}} object',
                    tags: ['{{_modelName}}']
                }
            },
            '/{{_modelName}}/deleteById/{id}': {
                delete: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    parameters: [{
                        description: '{{_modelName}} id',
                        in: 'path',
                        name: 'id',
                        required: true,
                        type: 'string'
                    }],
                    summary: 'delete {{_modelName}} object by id',
                    tags: ['{{_modelName}}']
                }
            },
            '/{{_modelName}}/getById/{id}': {
                get: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
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
                    summary: 'get {{_modelName}} object by id',
                    tags: ['{{_modelName}}']
                }
            },
            '/{{_modelName}}/getByQuery': {
                get: {
                    _requestHandler: local.cms2.serverMiddlewareCrudDefault,
                    parameters: [{
                        description: 'mongodb query',
                        default: '{"_id":"foo"}',
                        in: 'query',
                        name: 'query',
                        required: true,
                        schema: { $ref: '#/definitions/Object' }
                    }, {
                        description: 'mongodb cursor limit',
                        default: 1,
                        in: 'query',
                        name: 'limit',
                        required: true,
                        type: 'integer'
                    }, {
                        description: 'mongodb cursor sort',
                        default: '{"timeModified":-1}',
                        in: 'query',
                        name: 'sort',
                        required: true,
                        schema: { $ref: '#/definitions/Object' }
                    }],
                    responses: {
                        200: {
                            description: '200 ok - ' +
                                'http://jsonapi.org/format/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonApiResponseData{{_modelName}}' }
                        }
                    },
                    summary: 'get {{_modelName}} object by query',
                    tags: ['{{_modelName}}']
                }
            }
        }
    }, 2);
}
// init extra options properties
options.definitions['JsonApiResponseData{{_modelName}}'] = {
    allOf: [{ $ref: '#/definitions/JsonApiResponseData' }],
    properties: { data: { $ref: '#/definitions/{{_modelName}}' } }
};
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
        // init pathMethod.operationId
        pathMethod.operationId = path.split('/')[2];
        // init pathMethod._*
        Object.keys(options).forEach(function (key) {
            if (key[0] === '_' && typeof options[key] === 'string') {
                pathMethod[key] = pathMethod[key] || options[key];
            }
        });
        pathMethod._method = method;
        pathMethod._path = path;
        pathMethod._requestHandlerKey = path.replace((/\{\S*?\}/), '');
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
var modeNext, onNext, onTaskEnd, swagger, tmp;
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
                    swagger = swagger || local.cms2.requestHandlerDict[tmp];
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
            onNext();
            break;
        case 3:
            onTaskEnd = local.utility2.onTaskEnd(onNext);
            onTaskEnd.counter += 1;
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
                    onTaskEnd.counter += 1;
                    local.utility2.streamReadAll(request, function (error, data) {
                        swagger.paramDict[param.name] = String(data);
                        onTaskEnd(error);
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
            onTaskEnd();
            break;
        case 4:
            // parse paramDict
            swagger.parameters.forEach(function (parameter) {
                swagger.paramDict[parameter.name] = local.cms2.modelValidateProperty({
                    data: swagger.paramDict[parameter.name],
                    key: parameter.name,
                    parse: true,
                    property: parameter
                });
            });
            // rename id to _id
            local.cms2.modelIdTo_Id(swagger.paramDict);
            // init responseData
            // http://jsonapi.org/format/#document-structure-resource-objects
            local.utility2.objectSetDefault(swagger, { responseData: { data: {
                _id: swagger.paramDict._id ||
                    (swagger.paramDict.body && swagger.paramDict.body._id) ||
                    local.utility2.uuidTime(),
                id: swagger.paramDict.type ||
                    (swagger.paramDict.body && swagger.paramDict.body.type)
            } } }, -1);
            // init _id
            swagger.responseData.data._id =
                swagger.responseData.data._id || local.utility2.uuidTime();
            // get previously saved data
            if (swagger.model) {
                swagger.model.collection.findOne({
                    _id: swagger.responseData.data._id
                }, function (error, dataPrevious) {
                    // jslint-hack
                    local.utility2.nop(error);
                    swagger.dataPrevious = dataPrevious;
                    onNext();
                });
                return;
            }
            onNext();
            break;
        case 5:
            // run serverMiddlewareHookBefore
            local.cms2.serverMiddlewareHookBefore(request, response, onNext);
            break;
        case 6:
            // run _requestHandler
            if (swagger._requestHandler) {
                swagger._requestHandler(request, response, onNext);
                return;
            }
            onNext();
            break;
        case 7:
            // run serverMiddlewareHookAfter
            local.cms2.serverMiddlewareHookAfter(request, response, onNext);
            break;
        case 8:
            // end response
            response.end(JSON.stringify(
                // rename _id to id
                local.cms2.model_IdToId(
                    // jsonCopy object to prevent side-effect
                    local.utility2.jsonCopy(swagger.responseData)
                )
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
                        switch (swagger.operationId) {
                        case 'create':
                        case 'createOrReplace':
                            // update data from body
                            local.utility2.objectSetOverride(data, swagger.paramDict.body);
                            // normalize data
                            local.cms2.modelNormalize({
                                data: data,
                                dataPrevious: swagger.dataPrevious
                            });
                            // validate data
                            local.cms2.modelValidate({
                                data: data,
                                key: swagger._modelName,
                                model: swagger.model
                            });
                            onNext(null, data);
                            break;
                        case 'createOrUpdate':
                            // update data from body
                            local.utility2.objectSetOverride(data, swagger.paramDict.body);
                            // init _aliasList
                            data._aliasList =
                                data._aliasList || options.dataPrevious._aliasList;
                            // normalize data
                            local.cms2.modelNormalize({
                                data: data,
                                dataPrevious: swagger.dataPrevious
                            });
                            // update previously saved data with current data
                            swagger.dataUpdated = local.utility2.objectSetOverride(
                                // jsonCopy object to prevent side-effect
                                local.utility2.jsonCopy(swagger.dataPrevious),
                                data
                            );
                            // validate updated data
                            local.cms2.modelValidate({
                                data: swagger.dataUpdated,
                                key: swagger._modelName,
                                model: swagger.model
                            });
                            onNext(null, data);
                            break;
                        case 'deleteById':
                            modeNext = NaN;
                            swagger.model.collection.removeOne({ _id: data._id }, onNext);
                            break;
                        case 'getById':
                            swagger.model.collection.findOne({ _id: data._id }, onNext);
                            break;
                        case 'getByQuery':
                            swagger.model.collection
                                .find(swagger.paramDict.query)
                                .limit(swagger.paramDict.limit)
                                .sort(swagger.paramDict.sort)
                                .toArray(onNext);
                            break;
                        default:
                            throw new Error('invalid crud operation - ' +
                                request.method + ' ' + request.url);
                        }
                        break;
                    case 2:
                        switch (swagger.operationId) {
                        case 'create':
                            modeNext = NaN;
                            // insert data
                            swagger.model.collection.insert(data, onNext);
                            break;
                        case 'createOrReplace':
                            modeNext = NaN;
                            // init responseData.data
                            swagger.responseData.data = swagger.dataUpdated;
                            // upsert data
                            swagger.model.collection.update(
                                { _id: data._id },
                                { $set: data },
                                { upsert: true },
                                onNext
                            );
                            break;
                        case 'createOrUpdate':
                            modeNext = NaN;
                            // upsert data
                            swagger.model.collection.update(
                                { _id: data._id },
                                data,
                                { upsert: true },
                                onNext
                            );
                            break;
                        case 'getById':
                        case 'getByQuery':
                            modeNext = NaN;
                            swagger.responseData.data = data;
                            onNext();
                            break;
                        }
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
            response.end(JSON.stringify(local.cms2.model_IdToId({ errors: [{
                _id: request.swagger.responseData._id,
                code: error.code,
                title: error.message,
                detail: error.stack,
                status: response.statusCode
            }] })));
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
                        key: { type: 'string' },
                        type: { type: 'string' }
                    },
                    required: ['key']
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
                        _aliasList: {
                            items: { $ref: '#/definitions/Alias' },
                            type: 'array'
                        },
                        _timeCreated: { format: 'date-time', type: 'string' },
                        _timeModified: { format: 'date-time', type: 'string' },
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
                },
                Object: { properties: {} }
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
            _createIndexList: [[{ '_aliasList.key': 1 }, { sparse: true, unique: true }]],
            _crudDefault: true,
            _modelName: 'ContentDraft',
            definitions: {
                ContentDraft: {
                    allOf: [{ $ref: '#/definitions/JsonApiResource' }],
                    properties: {
                        content: { type: 'string' },
                        summary: { type: 'string' },
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
            _createIndexList: [[{ '_aliasList.key': 1 }, { sparse: true, unique: true }]],
            _crudDefault: true,
            _modelName: 'User',
            definitions: {
                User: {
                    allOf: [{ $ref: '#/definitions/JsonApiResource' }],
                    properties: {
                        _aliasList: {
                            items: { $ref: '#/definitions/Alias' },
                            type: 'array'
                        },
                        roleList: {
                            items: { type: 'string' },
                            type: 'array'
                        },
                        passwordHash: { type: 'string' },
                        passwordSalt: { type: 'string' }
                    }
                }
            },
            paths: {
                '/User/login': {
                    // post /User/login - userLogin
                    post: {
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
                        summary: 'login user to new session',
                        tags: ['User']
                    }
                },
                '/User/logout': {
                    // delete /User/logout - userLogout
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
                    _id: 'foo',
                    _aliasList: [{key: '1', key2: 'ofdisfsadf'}],
                    content: '1'
                }),
                method: 'PATCH',
                url: '/api/v0.1/ContentDraft/createOrUpdate'
            }, debugPrint);
            return;
        });
        break;
    }
}());
