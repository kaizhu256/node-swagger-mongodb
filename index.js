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
        local.swagger_mongodb.schemaDereference = function ($ref) {
            /*
                this function will try to dereference the schema from $ref
            */
            try {
                return local.swagger_mongodb.swaggerJson
                    .definitions[(/^\#\/definitions\/(\w+)$/).exec($ref)[1]];
            } catch (ignore) {
            }
        };

        local.swagger_mongodb.normalizeErrorJsonApi = function (error) {
            /*
                this function will normalize the error to jsonapi format,
                http://jsonapi.org/format/#errors
            */
            error.errors = [{
                code: error.code,
                message: error.message,
                title: error.title,
                detail: error.stack,
                status: Number(error.status) || 500
            }];
            return local.swagger_mongodb.normalizeIdSwagger(error);
        };

        local.swagger_mongodb.normalizeIdMongodb = function (data) {
            /*
                this function will recursively convert the property id to _id
            */
            local.utility2.objectTraverse(data, function (element) {
                if (element && element.id) {
                    element._id = element._id || element.id;
                    delete element.id;
                }
            }, 64);
            return data;
        };

        local.swagger_mongodb.normalizeIdSwagger = function (data) {
            /*
                this function will recursively convert the property _id to id
            */
            local.utility2.objectTraverse(data, function (element) {
                if (element && element._id) {
                    element.id = element.id || element._id;
                    delete element._id;
                }
            }, 8);
            return data;
        };

        local.swagger_mongodb.validateParameters = function (options) {
            /*
               this function will validate options.data against options.parameters
            */
            var data, key, parameters;
            try {
                if (!(options.depth > 0)) {
                    return;
                }
                data = options.data;
                // validate data
                local.utility2.assert(data && typeof data === 'object', data);
                parameters = options.parameters || [];
                parameters.forEach(function (param) {
                    key = param.name;
                    local.swagger_mongodb.validateProperty({
                        data: data[key],
                        depth: options.depth - 1,
                        key: key,
                        property: param,
                        required: param.required
                    });
                });
            } catch (errorCaught) {
                errorCaught.message = '"' + options.key + '.' + key + '" - ' +
                    errorCaught.message;
                errorCaught.stack = errorCaught.message + '\n' + errorCaught.stack;
                throw errorCaught;
            }
        };

        local.swagger_mongodb.validateProperty = function (options) {
            /*
               this function will validate options.data against options.property
            */
            /*jslint bitwise: true, regexp: true*/
            var assert, data, format, property, tmp, type;
            assert = function (valid) {
                if (!valid) {
                    throw new Error('invalid "' + options.key + ':' + format +
                            '" property - ' + JSON.stringify(data));
                }
            };
            property = options.property || {};
            data = options.data;
            type = property.type || property.$ref || (property.schema && property.schema.$ref);
            format = property.format || type;
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
                    throw new Error('required "' + options.key + ':' + format +
                        '" property cannot be null or undefined');
                }
                return;
            }
            // validate property.type
// https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#data-types
            switch (type) {
            case 'array':
                assert(Array.isArray(data));
                // recurse - validate elements in list
                if (options.depth > 0) {
                    data.forEach(function (element) {
                        local.swagger_mongodb.validateProperty({
                            data: element,
                            depth: options.depth - 1,
                            key: options.key,
                            property: property.items
                        });
                    });
                }
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
            // recurse - validate schema against property.$ref
            if (options.depth > 0) {
                local.swagger_mongodb.validateSchema({
                    data: data,
                    depth: options.depth - 1,
                    key: options.key,
                    schema: local.swagger_mongodb.schemaDereference(type)
                });
            }
        };

        local.swagger_mongodb.validateSchema = function (options) {
            /*
               this function will validate options.data against options.schema
            */
            var data, key, schema;
            try {
                if (!(options.depth > 0)) {
                    return;
                }
                data = options.data;
                // validate data
                local.utility2.assert(data && typeof data === 'object', 'invalid data ' + data);
                schema = options.schema;
                // validate schema
                local.utility2.assert(
                    schema && typeof schema === 'object',
                    'invalid schema ' + schema
                );
                Object.keys(schema.properties || {}).forEach(function (_) {
                    key = _;
                    local.swagger_mongodb.validateProperty({
                        data: data[key],
                        depth: options.depth - 1,
                        key: key,
                        property: schema.properties[key],
                        required: schema.required && schema.required.indexOf(key) >= 0
                    });
                });
            } catch (errorCaught) {
                errorCaught.message = '"' + options.key + '.' + key + '" - ' +
                    errorCaught.message;
                errorCaught.stack = errorCaught.message + '\n' + errorCaught.stack;
                throw errorCaught;
            }
        };
    }());
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        local.swagger_mongodb.middleware = function (request, response, nextMiddleware) {
            /*
                this function will run the main swagger-middleware
            */
            var modeNext, onNext, onTaskEnd, swagger, tmp;
            modeNext = 0;
            onNext = function (error) {
                local.utility2.testTryCatch(function () {



/* jslint-indent-begin 20 */
/*jslint maxlen: 116*/
modeNext = error instanceof Error
    ? Infinity
    : modeNext + 1;
switch (modeNext) {
case 1:
    swagger = request.swagger = request.swagger || {};
    if (request.urlParsed.pathnameNormalized.indexOf(local.swagger_mongodb.swaggerJson.basePath) === 0) {
        swagger.pathname = swagger.pathname ||
            request.urlParsed.pathnameNormalized.replace(local.swagger_mongodb.swaggerJson.basePath, '');
        switch (swagger.pathname) {
        // serve swagger.json
        case '/swagger.json':
            response.end(local.utility2.jsonStringifyOrdered(local.swagger_mongodb.swaggerJson));
            return;
        }
        swagger.method = request.method.toLowerCase();
        swagger.path = local.swagger_mongodb.swaggerJson.paths[swagger.pathname];
        //!! if (!swagger.path) {
        //!! }
        swagger.pathMethod = swagger.path && swagger.path[swagger.method];
        if (swagger.pathMethod) {
            onNext();
            return;
        }
    }
    // default to nextMiddleware
    nextMiddleware();
    break;
case 2:
    onTaskEnd = local.utility2.onTaskEnd(onNext);
    onTaskEnd.counter += 1;
    // init paramDict
    swagger.paramDict = {};
    // parse path param
    tmp = request.urlParsed.pathname.replace(local.swagger_mongodb.swaggerJson.basePath, '').split('/');
    swagger.pathname.split('/').forEach(function (key, ii) {
        if ((/^\{\S*?\}$/).test(key)) {
            swagger.paramDict[key.slice(1, -1)] = tmp[ii];
        }
    });
    (swagger.pathMethod.parameters || []).forEach(function (param) {
        switch (param.in) {
        // parse body param
        case 'body':
            onTaskEnd.counter += 1;
            local.utility2.streamReadAll(request, local.utility2.onErrorJsonParse(function (
                error,
                data
            ) {
                swagger.paramDict[param.name] = data;
                onTaskEnd(error);
            }));
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
        // init default param
        swagger.paramDict[param.name] = swagger.paramDict[param.name] || param.default;
    });
    onTaskEnd();
    break;
case 3:
    // validate parameters
    local.swagger_mongodb.validateParameters({
        data: swagger.paramDict,
        depth: 8,
        key: swagger.pathname,
        parameters: swagger.pathMethod.parameters
    });
    onNext();
    break;
default:
    if (error) {
        local.swagger_mongodb.middlewareError(error, request, response, nextMiddleware);
        return;
    }
    // default to nextMiddleware
    nextMiddleware();
}
/* jslint-indent-end */



                }, onNext);
            };
            onNext();
        };

        local.swagger_mongodb.middlewareError = function (error, request, response) {
            /*
                this function will handle errors according to http://jsonapi.org/format/#errors
            */
            error = local.swagger_mongodb.normalizeErrorJsonApi(error);
            local.utility2.onErrorDefault(error);
            local.utility2.serverRespondHeadSet(request, response, error.status, {});
            // rename _id to id
            response.end(JSON.stringify(error));
        };

        local.swagger_mongodb.schemaCreate = function (options) {
            /*
                this function will create a collection from the given options,
                and update swaggerJson with it
            */
            var pathMethod, tmp;
            local.utility2.objectSetDefault(options, {
                // init default crud paths
                paths: options._crudDefault && {
                    '/{{_schemaName}}/countByQuery': { get: {
                        parameters: [{
                            description: 'mongodb query param',
                            default: '{}',
                            in: 'query',
                            name: 'query',
                            required: true,
                            type: 'object'
                        }],
                        summary: 'count {{_schemaName}} objects by query',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/createOne': { post: {
                        parameters: [{
                            description: '{{_schemaName}} object',
                            in: 'body',
                            name: 'body',
                            required: true,
                            schema: { $ref: '#/definitions/{{_schemaName}}' }
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'create one {{_schemaName}} object',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/deleteByIdOne/{id}': { delete: {
                        parameters: [{
                            description: '{{_schemaName}} id',
                            in: 'path',
                            name: 'id',
                            required: true,
                            type: 'string'
                        }],
                        summary: 'delete one {{_schemaName}} object by id',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/existsByIdOne/{id}': { get: {
                        parameters: [{
                            description: '{{_schemaName}} id',
                            in: 'path',
                            name: 'id',
                            required: true,
                            type: 'string'
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'check if {{_schemaName}} object exists by id',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/getByIdOne/{id}': { get: {
                        parameters: [{
                            description: '{{_schemaName}} id',
                            in: 'path',
                            name: 'id',
                            required: true,
                            type: 'string'
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'get one {{_schemaName}} object by id',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/getByQueryMany': { get: {
                        parameters: [{
                            description: 'mongodb query param',
                            default: '{}',
                            in: 'query',
                            name: 'query',
                            required: true,
                            type: 'object'
                        }, {
                            description: 'mongodb projection param',
                            default: '{}',
                            in: 'query',
                            name: 'projection',
                            required: true,
                            type: 'object'
                        }, {
                            description: 'mongodb cursor hint param',
                            in: 'query',
                            name: 'hint',
                            type: 'object'
                        }, {
                            description: 'mongodb cursor limit param',
                            default: 8,
                            in: 'query',
                            name: 'limit',
                            required: true,
                            type: 'integer'
                        }, {
                            description: 'mongodb cursor sort param',
                            default: '{"_timeModified":-1}',
                            in: 'query',
                            name: 'sort',
                            required: true,
                            type: 'object'
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'get many {{_schemaName}} objects by query',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/replaceOne': { put: {
                        parameters: [{
                            description: '{{_schemaName}} object',
                            in: 'body',
                            name: 'body',
                            required: true,
                            schema: { $ref: '#/definitions/{{_schemaName}}' }
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'replace one {{_schemaName}} object',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/replaceOrCreateOne': { put: {
                        parameters: [{
                            description: '{{_schemaName}} object',
                            in: 'body',
                            name: 'body',
                            required: true,
                            schema: { $ref: '#/definitions/{{_schemaName}}' }
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'replace or create one {{_schemaName}} object',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/updateOne': { patch: {
                        parameters: [{
                            description: '{{_schemaName}} object',
                            in: 'body',
                            name: 'body',
                            required: true,
                            schema: { $ref: '#/definitions/{{_schemaName}}' }
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'update one {{_schemaName}} object',
                        tags: ['{{_schemaName}}']
                    } },
                    '/{{_schemaName}}/updateOrCreateOne': { patch: {
                        parameters: [{
                            description: '{{_schemaName}} object',
                            in: 'body',
                            name: 'body',
                            required: true,
                            schema: { $ref: '#/definitions/{{_schemaName}}' }
                        }],
                        responses: {
                            200: {
                                description: '200 ok - ' +
                                    'http://jsonapi.org/format/#document-structure-top-level',
                                schema:
                                    { $ref: '#/definitions/JsonApiResponseData{{_schemaName}}' }
                            }
                        },
                        summary: 'update or create one {{_schemaName}} object',
                        tags: ['{{_schemaName}}']
                    } }
                },
                // init default definitions
                definitions: {
                    'JsonApiResponseData{{_schemaName}}': {
                        properties: { data: {
                            items: { $ref: '#/definitions/{{_schemaName}}' },
                            type: 'array'
                        } },
                        'x-inheritList': [{ $ref: '#/definitions/JsonApiResponseData' }]
                    }
                }
            }, 2);
            // recursively stringFormat options
            local.utility2.objectTraverse(options, function (element) {
                Object.keys(element && typeof element === 'object'
                    ? element
                    : {}).forEach(function (key) {
                    tmp = local.utility2.stringFormat(key, options);
                    if (tmp !== key) {
                        // if there is no collision, then rename key
                        if (element[tmp] === undefined) {
                            element[tmp] = element[key];
                        }
                        // remove old key
                        delete element[key];
                    }
                    if (typeof element[tmp] === 'string') {
                        element[tmp] = local.utility2.stringFormat(element[tmp], options);
                    }
                });
            }, 8);
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
                });
            });
            // save tags
            tmp = {};
            [local.swagger_mongodb.swaggerJson.tags, options.tags].forEach(function (tags) {
                (tags || []).forEach(function (element) {
                    tmp[element.name] = element;
                });
            });
            tmp = Object.keys(tmp).sort().map(function (key) {
                return tmp[key];
            });
            // update swaggerJson
            local.utility2.objectSetOverride(
                local.swagger_mongodb.swaggerJson,
                // jsonCopy object to prevent side-effect
                local.utility2
                    .objectTraverse(local.utility2.jsonCopy(options), function (element) {
                        if (element && typeof element === 'object') {
                            Object.keys(element).forEach(function (key) {
                                // security - remove private underscored key
                                if (key[0] === '_') {
                                    delete element[key];
                                }
                            });
                        }
                    }, 8),
                2
            );
            // restore tags
            local.swagger_mongodb.swaggerJson.tags = tmp;
            // init properties from x-inheritList
            [0, 1, 2, 3].forEach(function () {
                Object.keys(local.swagger_mongodb.swaggerJson.definitions).forEach(function (schema) {
                    schema = local.swagger_mongodb.swaggerJson.definitions[schema];
                    // jsonCopy object to prevent side-effect
                    local.utility2.jsonCopy(schema['x-inheritList'] || [])
                        .reverse()
                        .forEach(function (element) {
                            local.utility2.objectSetDefault(schema, {
                                properties:
                                    (local.swagger_mongodb.schemaDereference(element.$ref) || {})
                                    .properties
                            }, 2);
                        });
                });
            });
            // jsonCopy object to prevent side-effect
            local.swagger_mongodb.swaggerJson = local.utility2.jsonCopy(local.swagger_mongodb.swaggerJson);
            // init swagger-api
            local.swagger_mongodb.swaggerApiUpdate(options);
        };

        local.swagger_mongodb.swaggerApiUpdate = function (options) {
            /*
                this function will update the swagger-api from local.swagger_mongodb.swaggerJson
            */
            var collection, schemaName, swaggerJson;
            // jsonCopy object to prevent side-effect
            swaggerJson = local.utility2.jsonCopy(local.swagger_mongodb.swaggerJson);
            // validate swaggerJson
            local.swagger_tools.v2
                .validate(swaggerJson, function (error, result) {
                    if (error) {
                        local.utility2.onErrorDefault(error);
                        return;
                    }
                    (result && result.errors && result.errors.length
                        ? result.errors
                        : result && result.warnings && result.warnings.lengh
                        ? result.warnings
                        : []).slice(0, 8).forEach(function (element) {
                        console.error('swagger schema - ' + element.code + ' - ' +
                            element.message + ' - ' + JSON.stringify(element.path));
                    });
                    if (result && result.errors && result.errors[0]) {
                        throw new Error(result.errors[0].message);
                    }
                });
            // init swagger-api
            local.swagger_mongodb.api = new local.swagger_mongodb.SwaggerClient({
                url: 'http://localhost:' + local.utility2.serverPortInit()
            });
            local.swagger_mongodb.api.buildFromSpec(swaggerJson);
            // init mongodb-collection
            local.utility2.taskRunOrSubscribe({ key: 'swagger-mongodb.mongodbConnect' }, function () {
                if (!options._collectionName) {
                    return;
                }
                local.swagger_mongodb.db.collectionDict = local.swagger_mongodb.db.collectionDict || {};
                collection = local.swagger_mongodb.db.collectionDict[options._collectionName] =
                    local.swagger_mongodb.db.collectionDict[options._collectionName] ||
                    local.swagger_mongodb.db.collection(options._collectionName);
                if (!options._schemaName) {
                    return;
                }
                schemaName = options._schemaName;
                [
                    'countByQuery',
                    'createOne',
                    'deleteByIdOne',
                    'existsByIdOne',
                    'getByIdOne',
                    'getByQueryMany',
                    'replaceOrCreateOne',
                    'updateOrCreateOne'
                ].forEach(function (key) {
                    local.swagger_mongodb.api[options._schemaName]['_' + key] = function (
                        options,
                        onError
                    ) {
                        options.collection = collection;
                        options.operationId = key;
                        options.schemaName = schemaName;
                        local.swagger_mongodb.swaggerCrud(options, onError);
                    };
                });
            });
        };

        local.swagger_mongodb.swaggerCrud = function (options, onError) {
            /*
                this function will run crud on the given schema
            */
            var modeNext, onNext, result;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error instanceof Error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        local.swagger_mongodb.normalizeIdMongodb(options.data);
                        local.swagger_mongodb.validateSchema({
                            data: options.data,
                            depth: 8,
                            key: options.schemaName,
                            schema: local.swagger_mongodb.swaggerJson.definitions[options.schemaName]
                        });
                        // init id
                        options.data._id =
                            String(options.data._id || local.utility2.uuidTime());
                        switch (options.operationId) {
                        case 'countByQuery':
                            modeNext = Infinity;
                            // count data
                            options.collection.count(options.data.query, onNext);
                            break;
                        case 'createOne':
                            modeNext = Infinity;
                            // insert data
                            options.collection.insert(options.data, onNext);
                            break;
                        case 'deleteByIdOne':
                            modeNext = Infinity;
                            // delete data
                            options.collection.removeOne({ _id: options.data._id }, onNext);
                            break;
                        case 'existsByIdOne':
                            modeNext = Infinity;
                            // find data
                            options.collection.findOne({ _id: options.data._id }, {}, onNext);
                            break;
                        case 'getByIdOne':
                            modeNext = Infinity;
                            // find data
                            options.collection.findOne({ _id: options.data._id }, onNext);
                            break;
                        case 'getByQueryMany':
                            modeNext = Infinity;
                            // find data
                            options.cursor = options.collection
                                .find(options.data.query, options.data.projection);
                            ['hint', 'limit', 'skip', 'sort'].forEach(function (key) {
                                if (options.data.hasOwnProperty(key)) {
                                    options.cursor[key]([options.data[key]]);
                                }
                            });
                            break;
                        case 'replaceOrCreateOne':
                            modeNext = 10;
                            // init _timeCreated
                            options.data._timeCreated =
                                // init _timeModified
                                options.data._timeModified =
                                new Date().toISOString();
                            onNext();
                            break;
                        case 'updateOrCreateOne':
                            // find data
                            options.collection.findOne({ _id: options.data._id }, onNext);
                            break;
                        default:
                            onNext(new Error('invalid crud operation - ' +
                                options.schemaName + '.' + options.operationId));
                        }
                        break;
                    case 2:
                        switch (options.operationId) {
                        case 'updateOrCreateOne':
                            modeNext = 10;
                            options.dataPrevious = data || {};
                            // init _timeCreated
                            options.data._timeCreated =
                                options.dataPrevious._timeCreated || new Date().toISOString();
                            // init _timeModified
                            options.data._timeModified = new Date().toISOString();
                            onNext();
                            break;
                        }
                        break;
                    case 11:
                        switch (options.operationId) {
                        case 'replaceOrCreateOne':
                            // upsert data
                            options.collection.update(
                                { _id: options.data._id },
                                options.data,
                                { upsert: true },
                                onNext
                            );
                            break;
                        case 'updateOrCreateOne':
                            // upsert data
                            options.collection.update(
                                { _id: options.data._id },
                                { $set: options.data },
                                { upsert: true },
                                onNext
                            );
                            break;
                        }
                        break;
                    default:
                        if (error) {
                            error._id = options.data._id;
                            onError(local.swagger_mongodb.normalizeErrorJsonApi(error));
                            return;
                        }
                        result = { _id: options.data._id };
                        switch (options.operationId) {
                        case 'countByQuery':
                        case 'getByIdOne':
                        case 'getByQueryMany':
                            result.data = data;
                            break;
                        case 'createOne':
                        case 'deleteByIdOne':
                        case 'existsByIdOne':
                            result.meta = data;
                            break;
                        case 'replaceOrCreateOne':
                            result.data = options.data;
                            result.meta = data;
                            break;
                        case 'updateOrCreateOne':
                            result.data = local.utility2.objectSetOverride(
                                options.dataPrevious,
                                options.data
                            );
                            result.meta = data;
                            break;
                        }
                        onError(
                            null,
                            local.utility2.jsonCopy(local.swagger_mongodb.normalizeIdSwagger(result))
                        );
                        break;
                    }
                }, onError);
            };
            onNext();
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export swagger-mongodb
        window.swagger_mongodb = local.swagger_mongodb;
        // require modules
        local.utility2 = window.utility2;
        break;



    // run node js-env code
    case 'node':
        // export swagger-mongodb
        module.exports = local.swagger_mongodb;
        // require modules
        local.fs = require('fs');
        local.mongodb = require('mongodb');
        local.path = require('path');
        local.swagger_tools = require('swagger-ui-lite/swagger-tools-standalone-min.js');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.url = require('url');
        local.utility2 = require('utility2');
        local.vm = require('vm');
        // init assets
        local.swagger_mongodb['/assets/swagger-mongodb.js'] =
            local.fs.readFileSync(__filename, 'utf8');
        local.swagger_mongodb.swaggerJson = {
            basePath: local.utility2.envDict.npm_config_mode_api_prefix || '/api/v0.1',
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
                        _timeCreated: { format: 'date-time', type: 'string' },
                        _timeModified: { format: 'date-time', type: 'string' },
                        parentId: { type: 'string' },
                        id: { type: 'string' },
                        subtype: { type: 'string' },
                        type: { type: 'string' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-top-level
                JsonApiResponseData: {
                    properties: {
                        data: {
                            items: { $ref: '#/definitions/JsonApiResource' },
                            type: 'array'
                        },
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
                description: 'demo of swagger-mongodb swagger-api',
                title: 'swagger-mongodb api',
                version: '0.1'
            },
            paths: {},
            swagger: '2.0',
            tags: []
        };
        local.utility2.cacheDict.assets['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            .replace(
                'http://petstore.swagger.io/v2/swagger.json',
                local.swagger_mongodb.swaggerJson.basePath + '/swagger.json'
            );
        local.utility2.cacheDict.assets['/assets/swagger-ui.rollup.css'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.rollup.css',
                'utf8'
            );
        local.utility2.cacheDict.assets['/assets/swagger-ui.rollup.js'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.rollup.js',
                'utf8'
            )
            // swagger-hack - add object type
            .replace((/var str;/g), 'var str = type === "object" ? "object" : undefined;')
            // swagger-hack - add validation error handling
            .replace(
                'var missingParams = this.getMissingParams(args);',
                'try { (' + String(
                    /* istanbul ignore next */
                    function (self, data) {
                        var swagger_mongodb;
                        try {
                            swagger_mongodb = window.swagger_mongodb;
                        } catch (ignore) {
                        }
                        try {
                            swagger_mongodb = swagger_mongodb || require('swagger_mongodb');
                        } catch (ignore) {
                        }
                        if (swagger_mongodb) {
                            swagger_mongodb.validateParameters({
                                data: data,
                                depth: 8,
                                key: self.operation.operationId,
                                parameters: self.parameters
                            });
                        }
                    }
                ).replace(/\n/g, ' ') +
                    '(this, args)); } catch (errorCaught) { error(errorCaught); return; } ' +
                    'var missingParams = this.getMissingParams(args);'
            );
        local.utility2.cacheDict.assets['/assets/swagger-ui.explorer_icons.png'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.explorer_icons.png');
        local.utility2.cacheDict.assets['/assets/swagger-ui.logo_small.png'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.logo_small.png');
        local.utility2.cacheDict.assets['/assets/swagger-ui.throbber.gif'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.throbber.gif');
        local.swagger_tools
            .v2
            .validators['schema.json']
            .cache['schema.json']
            .definitions
            .queryParameterSubSchema.
            properties.
            type.
            // swagger-hack - hack swagger-tools.validate to allow object type
            enum = ['string', 'number', 'boolean', 'integer', 'array', 'object'];
        // init SwaggerClient
        (function () {
            local.Handlebars = {
                registerHelper: local.utility2.nop,
                template: local.utility2.nop
            };
            local.XMLHttpRequest = function () {
                var self;
                self = this;
                self.headers = {};
            };
            local.XMLHttpRequest.prototype.onreadystatechange = local.utility2.nop;
            local.XMLHttpRequest.prototype.open = function (method, url) {
                this.method = method;
                this.url = url;
            };
            local.XMLHttpRequest.prototype.send = function (data) {
                var self;
                self = this;
                self.data = data;
                self.xhr = self;
                local.utility2.ajax(self, local.utility2.nop);
            };
            local.XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
                this.headers[key.toLowerCase()] = value;
            };
            local.$ = local.utility2.nop;
            local.console = console;
            local.clearTimeout = clearTimeout;
            local.location = {};
            local.setTimeout = setTimeout;
            local.window = local;
            local.vm.runInNewContext(
                local.utility2.cacheDict.assets['/assets/swagger-ui.rollup.js']
                    // swagger-hack - remove browser js-env code
                    .replace((/[\S\s]+?\/underscore-min\.js \*\//), function (match0) {
                        return match0.replace((/\S+/g), '');
                    }),
                local,
                __dirname + '/swagger-ui.rollup.js'
            );
            local.swagger_mongodb.SwaggerClient = local.SwaggerClient;
            local.swagger_mongodb.SwaggerUi = local.SwaggerUi;
        }());
        // init swagger-api
        local.swagger_mongodb.swaggerApiUpdate({});
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
            : local.modeJs === 'node'
            ? require('utility2')
            : null;
        // init swagger-mongodb
        local.swagger_mongodb = { cacheDict: { collection: {} }, local: local };
    }());
    return local;
}())));
