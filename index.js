/*jslint
    bitwise: true,
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    regexp: true,
    stupid: true
*/
(function (local) {
    'use strict';



    // run shared js-env code
    (function () {
        local.swmgdb.normalizeErrorJsonApi = function (error) {
            /*
                this function will normalize the error to jsonapi format,
                http://jsonapi.org/format/#errors
            */
            error.status = Number(error.status) || 500;
            error.errors = error.errors || [{
                code: error.code,
                message: error.message,
                title: error.title,
                detail: error.stack,
                status: error.status
            }];
            return local.swmgdb.normalizeIdSwagger(error);
        };

        local.swmgdb.normalizeIdMongodb = function (data) {
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

        local.swmgdb.normalizeIdSwagger = function (data) {
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

        local.swmgdb.schemaDereference = function ($ref) {
            /*
                this function will try to dereference the schema from $ref
            */
            try {
                return local.swmgdb.swaggerJson
                    .definitions[(/^\#\/definitions\/(\w+)$/).exec($ref)[1]];
            } catch (ignore) {
            }
        };

        local.swmgdb.validateParameters = function (options) {
            /*
               this function will validate options.data against options.parameters
            */
            var data, key;
            try {
                data = options.data;
                // validate data
                local.utility2.assert(data && typeof data === 'object', data);
                options.parameters.forEach(function (param) {
                    key = param.name;
                    local.swmgdb.validateProperty({
                        data: data[key],
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

        local.swmgdb.validateProperty = function (options) {
            /*
               this function will validate options.data against options.property
            */
            var assert, data, format, property, tmp, type;
            assert = function (valid) {
                if (!valid) {
                    throw new Error('invalid "' + options.key + ':' + format +
                            '" property - ' + JSON.stringify(data));
                }
            };
            data = options.data;
            // validate undefined data
            if (data === null || data === undefined) {
                if (options.required) {
                    throw new Error('required "' + options.key + ':' + format +
                        '" property cannot be null or undefined');
                }
                return;
            }
            property = options.property;
            // init type
            type = property.$ref || (property.schema && property.schema.$ref);
            if (type) {
                local.swmgdb.validateSchema({
                    circularList: options.circularList,
                    data: data,
                    schema: local.swmgdb.schemaDereference(type)
                });
                return;
            }
            type = property.type;
            format = property.format || type;
            // init circularList
            if (data && typeof data === 'object') {
                options.circularList = options.circularList || [];
                if (options.circularList.indexOf(data) >= 0) {
                    return;
                }
                options.circularList.push(data);
            }
            // validate property.type
// https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md#data-types
            switch (type) {
            case 'array':
                assert(Array.isArray(data));
                // recurse - validate elements in list
                data.forEach(function (element) {
                    local.swmgdb.validateProperty({
                        circularList: options.circularList,
                        data: element,
                        key: options.key,
                        property: property.items
                    });
                });
                break;
            case 'boolean':
                assert(typeof data === 'boolean');
                break;
            case 'integer':
                assert(typeof data === 'number' && isFinite(data) && (data | 0) === data);
                switch (property.format) {
                case 'int32':
                case 'int64':
                    break;
                }
                break;
            case 'number':
                assert(typeof data === 'number' && isFinite(data));
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
                    assert(tmp.getTime() &&
                        data.slice(0, 19) === tmp.toISOString().slice(0, 19));
                    break;
                case 'email':
                    assert(local.utility2.regexpEmailValidate.test(data));
                    break;
                case 'json':
                    try {
                        JSON.parse(data);
                    } catch (errorCaught) {
                        assert(null);
                    }
                    break;
                }
                break;
            }
        };

        local.swmgdb.validateSchema = function (options) {
            /*
               this function will validate options.data against options.schema
            */
            var data, key, schema;
            try {
                data = options.data;
                // init circularList
                if (data && typeof data === 'object') {
                    options.circularList = options.circularList || [];
                    if (options.circularList.indexOf(data) >= 0) {
                        return;
                    }
                    options.circularList.push(data);
                }
                // validate data
                local.utility2.assert(data && typeof data === 'object', 'invalid data ' + data);
                schema = options.schema;
                // validate schema
                local.utility2.assert(
                    schema && typeof schema === 'object',
                    'invalid schema ' + schema
                );
                Object.keys(schema.properties).forEach(function (_) {
                    key = _;
                    local.swmgdb.validateProperty({
                        circularList: options.circularList,
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
        local.swmgdb._crudApi = function (options, onError) {
            /*
                this function will run the low-level crud-api on the given options.data
            */
            var modeNext, onNext;
            modeNext = 0;
            onNext = local.utility2.onErrorWithStack(function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // validate parameters
                        local.swmgdb.validateParameters({
                            data: options.data,
                            key: options.schemaName + '.' + options.operationId,
                            parameters: options.parameters
                        });
                        // normalize id to mongodb format
                        local.swmgdb.normalizeIdMongodb(options);
                        // init body
                        options.data = options.data.body || options.data;
                        // init id
                        options.data._id =
                            String(options.data._id || local.utility2.uuidTime());
                        // init collection
                        options.collection =
                            local.swmgdb.cacheDict.collection[options.collectionName];
                        // init _timeCreated
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                        case 'crudUpdateOne':
                        case 'crudUpdateOrCreateOne':
                            options.collection.findOne(
                                { _id: options.data._id },
                                { _timeCreated: 1 },
                                onNext
                            );
                            return;
                        }
                        onNext();
                        break;
                    case 2:
                        // init _timeCreated and _timeModified
                        switch (options.operationId) {
                        case 'crudCreateOne':
                            options.data._timeCreated = options.data._timeModified =
                                new Date().toISOString();
                            break;
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                        case 'crudUpdateOne':
                        case 'crudUpdateOrCreateOne':
                            options.data._timeModified = new Date().toISOString();
                            data = (data && data._timeCreated) || options.data._timeModified;
                            options.data._timeCreated =
                                data > options.data._timeCreated ||
                                isNaN(new Date(data).getTime())
                                ? options.data._timeModified
                                : data;
                            break;
                        }
                        switch (options.operationId) {
                        case 'crudCountByQuery':
                            // count data
                            options.collection.count(JSON.parse(options.data.query), onNext);
                            break;
                        case 'crudCreateOne':
                            // insert data
                            options.collection.insert(options.data, onNext);
                            break;
                        case 'crudDeleteByIdOne':
                            // delete data
                            options.collection.removeOne({ _id: options.data._id }, onNext);
                            break;
                        case 'crudExistsByIdOne':
                            // find data
                            options.collection.findOne(
                                { _id: options.data._id },
                                { _id: 1 },
                                onNext
                            );
                            break;
                        case 'crudGetByIdOne':
                            // find data
                            options.collection.findOne({ _id: options.data._id }, onNext);
                            break;
                        case 'crudGetByQueryMany':
                            // find data
                            options.cursor = options.collection.find(
                                JSON.parse(options.data.query),
                                JSON.parse(options.data.fields),
                                {
                                    hint: JSON.parse(options.data.hint),
                                    limit: JSON.parse(options.data.limit),
                                    skip: JSON.parse(options.data.skip),
                                    sort: JSON.parse(options.data.sort)
                                }
                            );
                            options.cursor.toArray(onNext);
                            break;
                        case 'crudReplaceOne':
                            // replace data
                            options.collection.update(
                                { _id: options.data._id },
                                options.data,
                                onNext
                            );
                            break;
                        case 'crudReplaceOrCreateOne':
                            // upsert data
                            options.collection.update(
                                { _id: options.data._id },
                                options.data,
                                { upsert: true },
                                onNext
                            );
                            break;
                        case 'crudUpdateOne':
                            // update data
                            options.collection.update(
                                { _id: options.data._id },
                                { $set: options.data },
                                onNext
                            );
                            break;
                        case 'crudUpdateOrCreateOne':
                            // upsert data
                            options.collection.update(
                                { _id: options.data._id },
                                { $set: options.data },
                                { upsert: true },
                                onNext
                            );
                            break;
                        default:
                            onNext(new Error('invalid crud operation - ' +
                                options.schemaName + '.' + options.operationId));
                        }
                        break;
                    case 3:
                        // jsonCopy object to prevent side-effect
                        options.response = {
                            _id: options.data._id,
                            meta: local.utility2.jsonCopy(data)
                        };
                        switch (options.operationId) {
                        case 'crudCountByQuery':
                        case 'crudGetByIdOne':
                        case 'crudGetByQueryMany':
                            options.response.data = [data];
                            break;
                        case 'crudCreateOne':
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                        case 'crudUpdateOne':
                        case 'crudUpdateOrCreateOne':
                            options.collection.findOne({ _id: options.data._id }, onNext);
                            return;
                        case 'crudExistsByIdOne':
                            options.response.data = [!!data];
                            break;
                        }
                        modeNext += 1;
                        onNext(error);
                        break;
                    case 4:
                        // jsonCopy object to prevent side-effect
                        options.response.data = [local.utility2.jsonCopy(data)];
                        onNext();
                        break;
                    default:
                        if (error) {
                            error._id = options.data._id;
                            error = onError(local.swmgdb.normalizeErrorJsonApi(error));
                        }
                        // normalize id to swagger format
                        onError(error, local.swmgdb.normalizeIdSwagger(options.response));
                    }
                }, onNext);
            });
            onNext();
        };

        local.swmgdb.apiUpdate = function (options) {
            /*
                this function will update the api
            */
            var methodPath, tmp;
            options.definitions = options.definitions || {};
            options.paths = options.paths || {};
            Object.keys(options.definitions).forEach(function (schemaName) {
                var collectionName, schema;
                schema = options.definitions[schemaName];
                collectionName = schema._collectionName;
                if (!collectionName) {
                    return;
                }
                // init _crudApi
                if (schema._crudApi) {
                    local.utility2.objectSetDefault(options, JSON.parse(
                        JSON.stringify(local.swmgdb.crudSwaggerJson)
                            .replace((/\{\{collectionName\}\}/g), collectionName)
                            .replace((/\{\{schemaName\}\}/g), schemaName)
                    ), 2);
                }
                // update cacheDict.collection
                local.utility2.taskRunOrSubscribe({
                    key: 'swagger-mongodb.mongodbConnect'
                }, function () {
                    local.swmgdb.cacheDict.collection[collectionName] =
                        local.swmgdb.db.collection(collectionName);
                });
            });
            // update paths
            Object.keys(options.paths).forEach(function (path) {
                Object.keys(options.paths[path]).forEach(function (method) {
                    methodPath = options.paths[path][method];
                    methodPath._method = method;
                    methodPath._path = path;
                    // init methodPath.responses
                    local.utility2.objectSetDefault(methodPath, { responses: {
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
                    // update cacheDict.methodPath
                    local.swmgdb.cacheDict.methodPath[method.toUpperCase() + ' ' + path.replace(
                        (/\{.*/),
                        function (match0) {
                            return match0.replace((/[^\/]+/), '');
                        }
                    )] = methodPath;
                });
            });
            // update and save tags
            tmp = {};
            [local.swmgdb.swaggerJson.tags, options.tags].forEach(function (tags) {
                (tags || []).forEach(function (element) {
                    tmp[element.name] = element;
                });
            });
            tmp = Object.keys(tmp).sort().map(function (key) {
                return tmp[key];
            });
            // update swaggerJson with options, with underscored keys removed
            local.utility2.objectSetOverride(
                local.swmgdb.swaggerJson,
                local.utility2.objectTraverse(
                    // jsonCopy object to prevent side-effect
                    local.utility2.jsonCopy(options),
                    function (element) {
                        if (element && typeof element === 'object') {
                            Object.keys(element).forEach(function (key) {
                                // security - remove underscored key
                                if (key[0] === '_') {
                                    delete element[key];
                                }
                            });
                        }
                    }
                ),
                2
            );
            // restore tags
            local.swmgdb.swaggerJson.tags = tmp;
            // init properties from x-inheritList
            [0, 1, 2, 3].forEach(function () {
                Object.keys(local.swmgdb.swaggerJson.definitions).forEach(function (schema) {
                    schema = local.swmgdb.swaggerJson.definitions[schema];
                    // jsonCopy object to prevent side-effect
                    local.utility2.jsonCopy(schema['x-inheritList'] || [])
                        .reverse()
                        .forEach(function (element) {
                            local.utility2.objectSetDefault(schema, {
                                properties:
                                    local.swmgdb.schemaDereference(element.$ref).properties
                            }, 2);
                        });
                });
            });
            // jsonCopy object to prevent side-effect
            local.swmgdb.swaggerJson =
                JSON.parse(local.utility2.jsonStringifyOrdered(local.swmgdb.swaggerJson));
            // validate swaggerJson
            local.swagger_tools.v2.validate(
                // jsonCopy object to prevent side-effect
                local.utility2.jsonCopy(local.swmgdb.swaggerJson),
                function (error, result) {
                    if (error) {
                        throw error;
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
                }
            );
            // init swagger-api
            local.swmgdb.api = new local.swmgdb.SwaggerClient({
                url: 'http://localhost:' + local.utility2.serverPortInit()
            });
            local.swmgdb.api.buildFromSpec(local.utility2.jsonCopy(local.swmgdb.swaggerJson));
        };

        local.swmgdb.middleware = function (request, response, nextMiddleware) {
            /*
                this function will run the main swagger-middleware
            */
            var modeNext, onNext, onTaskEnd, tmp;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {



/* jslint-indent-begin 20 */
/*jslint maxlen: 116*/
modeNext = error
    ? Infinity
    : modeNext + 1;
switch (modeNext) {
case 1:
    switch (request.urlParsed.pathnameNormalized) {
    case '/fonts/droid-sans-v6-latin-700.ttf':
    case '/fonts/droid-sans-v6-latin-700.woff':
    case '/fonts/droid-sans-v6-latin-700.woff2':
    case '/fonts/droid-sans-v6-latin-regular.ttf':
    case '/fonts/droid-sans-v6-latin-regular.woff':
    case '/fonts/droid-sans-v6-latin-regular.woff2':
        local.utility2.serverRespondHeadSet(request, response, 404, {});
        response.end();
        return;
    }
    // if request.url is not prefixed with swaggerJson.basePath, then default to nextMiddleware
    if (request.urlParsed.pathnameNormalized.indexOf(local.swmgdb.swaggerJson.basePath) === 0) {
        local.utility2.serverRespondHeadSet(request, response, null, {
            'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
            // enable cors
            // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
            'Access-Control-Allow-Origin': '*',
            // init content-type
            'Content-Type': 'application/json; charset=UTF-8'
        });
        // init swmgdbPathname
        request.swmgdbPathname = request.method + ' ' + request.urlParsed.pathnameNormalized
            .replace(local.swmgdb.swaggerJson.basePath, '');
        switch (request.swmgdbPathname) {
        case 'GET /swagger.json':
            response.end(JSON.stringify(local.swmgdb.swaggerJson));
            return;
        }
        // init swmgdbMethodPath
        while (true) {
            request.swmgdbMethodPath =
                local.swmgdb.cacheDict.methodPath[request.swmgdbPathname];
            // if can init swmgdbMethodPath, then continue to onNext
            if (request.swmgdbMethodPath) {
                onNext();
                return;
            }
            // if cannot init swmgdbMethodPath, then default to nextMiddleware
            if (request.swmgdbPathname === request.swmgdbPathnameOld) {
                break;
            }
            request.swmgdbPathnameOld = request.swmgdbPathname;
            request.swmgdbPathname =
                request.swmgdbPathname.replace((/\/[^\/]+?(\/*?)$/), '/$1');
        }
    }
    // default to next middleware
    modeNext = Infinity;
    onNext();
    break;
case 2:
    onTaskEnd = local.utility2.onTaskEnd(onNext);
    onTaskEnd.counter += 1;
    // init swmgdbParameters
    request.swmgdbParameters = {};
    // parse path param
    tmp = request.urlParsed.pathname.replace(local.swmgdb.swaggerJson.basePath, '').split('/');
    request.swmgdbMethodPath._path.split('/').forEach(function (key, ii) {
        if ((/^\{\S*?\}$/).test(key)) {
            request.swmgdbParameters[key.slice(1, -1)] = decodeURIComponent(tmp[ii]);
        }
    });
    request.swmgdbMethodPath.parameters.forEach(function (param) {
        switch (param.in) {
        // parse body param
        case 'body':
            onTaskEnd.counter += 1;
            local.utility2.streamReadAll(request, local.utility2.onErrorJsonParse(
                function (error, data) {
                    request.swmgdbParameters[param.name] = data;
                    onTaskEnd(error);
                }
            ));
            break;
        // parse header param
        case 'header':
            request.swmgdbParameters[param.name] = request.headers[param.name];
            break;
        // parse query param
        case 'query':
            request.swmgdbParameters[param.name] = request.urlParsed.query[param.name];
            break;
        }
        // init default param
        request.swmgdbParameters[param.name] =
            request.swmgdbParameters[param.name] || param.default;
    });
    onTaskEnd();
    break;
case 3:
    request.swmgdbMethodPath.parameters.forEach(function (param) {
        tmp = request.swmgdbParameters[param.name];
        // init default value
        if (tmp === undefined) {
            // jsonCopy object to prevent side-effect
            request.swmgdbParameters[param.name] = local.utility2.jsonCopy(param.default);
        }
        // JSON.parse swmgdbParameters
        if (param.type !== 'string' && (typeof tmp === 'string' || Buffer.isBuffer(tmp))) {
            request.swmgdbParameters[param.name] = JSON.parse(tmp);
        }
    });
    // validate parameters
    local.swmgdb.validateParameters({
        data: request.swmgdbParameters,
        key: request.swmgdbPathname,
        parameters: request.swmgdbMethodPath.parameters
    });
    // run default crud api
    if (request.swmgdbMethodPath._crudApi) {
        local.swmgdb._crudApi({
            collectionName: request.swmgdbMethodPath._collectionName,
            data: request.swmgdbParameters,
            operationId: request.swmgdbMethodPath.operationId,
            parameters: request.swmgdbMethodPath.parameters,
            schemaName: request.swmgdbMethodPath.tags[0]
        }, onNext);
        return;
    }
    onNext();
    break;
default:
    if (!error && data) {
        response.end(JSON.stringify(data));
        return;
    }
    // default to nextMiddleware
    nextMiddleware(error);
}
/* jslint-indent-end */



                }, onNext);
            };
            onNext();
        };

        local.swmgdb.onMiddlewareError = function (error, request, response) {
            /*
                this function will handle errors according to http://jsonapi.org/format/#errors
            */
            if (!error) {
                error = new Error('404 Not Found');
                error.status = 404;
            }
            error.message = request.method + ' ' + request.url + '\n' + error.message;
            error.stack = error.message + '\n' + error.stack;
            error = local.swmgdb.normalizeErrorJsonApi(error);
            // if modeErrorIgnore is undefined in url search params,
            // then print error.stack to stderr
            if (!(local.global.__coverage__ &&
                    local.utility2.envDict.npm_config_mode_npm_test &&
                    (/\bmodeErrorIgnore=1\b/).test(request.url))) {
                local.utility2.onErrorDefault(error);
            }
            local.utility2.serverRespondHeadSet(request, response, error.status, {});
            response.end(JSON.stringify(error));
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export swagger-mongodb
        window.swmgdb = local.swmgdb;
        // require modules
        local.utility2 = window.utility2;
        break;



    // run node js-env code
    case 'node':
        // export swagger-mongodb
        module.exports = local.swmgdb;
        module.exports.__dirname = __dirname;
        // require modules
        local.fs = require('fs');
        local.mongodb = require('mongodb');
        local.path = require('path');
        local.swagger_tools = require('swagger-ui-lite/swagger-tools-standalone-min.js');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.url = require('url');
        local.utility2 = require('utility2');
        local.vm = require('vm');
        // init swaggerJson
        local.swmgdb.swaggerJson = {
            basePath: local.utility2.envDict.npm_config_mode_api_prefix || '/api/v0',
            definitions: {
                // http://jsonapi.org/format/#errors
                JsonApiError: {
                    properties: {
                        code: { type: 'string' },
                        detail: { type: 'string' },
                        href: { type: 'string' },
                        id: { type: 'string' },
                        links: { items: { type: 'string' }, type: 'array' },
                        paths: { items: { type: 'string' }, type: 'array' },
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
                version: '0'
            },
            paths: {},
            swagger: '2.0',
            tags: []
        };
        // init assets
        local.swmgdb['/assets/swagger-mongodb.js'] =
            local.fs.readFileSync(__filename, 'utf8');
        local.utility2.cacheDict.assets['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            .replace(
                'http://petstore.swagger.io/v2/swagger.json',
                local.swmgdb.swaggerJson.basePath + '/swagger.json'
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
            // swagger-hack - save swaggerJson
            .replace(
                'this.apis = {};',
                'this.apis = {}; this.swaggerJson = JSON.parse(JSON.stringify(response))'
            )
            // swagger-hack - save swaggerJson
            .replace(
                'return url + requestUrl + querystring;',
                'return url + requestUrl + querystring + (args.$urlExtra || "");'
            )
            // swagger-hack - add validation error handling
            .replace('var missingParams = this.getMissingParams(args);', String() +
                'if (opts.modeErrorData) { ' +
                    'var onError = success; ' +
                    'error = function (error) { onError(error.obj || error, error); }; ' +
                    'success = function (data) { onError(null, data); }; ' +
                '} ' +
                'try { ' +
                    'window.swmgdb && window.swmgdb.validateParameters({ ' +
                        'data: args, ' +
                        'key: this.operation.operationId, ' +
                        'parameters: this.parameters ' +
                    '}); ' +
                '} catch (errorCaught) { ' +
                    'error(errorCaught); ' +
                    'return; ' +
                '} ' +
                'var missingParams = this.getMissingParams(args);');
        local.utility2.cacheDict.assets['/assets/swagger-ui.explorer_icons.png'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.explorer_icons.png');
        local.utility2.cacheDict.assets['/assets/swagger-ui.logo_small.png'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.logo_small.png');
        local.utility2.cacheDict.assets['/assets/swagger-ui.throbber.gif'] = local.fs
            .readFileSync(local.swagger_ui_lite.__dirname +
                '/swagger-ui.throbber.gif');
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
            local.swmgdb.SwaggerClient = local.SwaggerClient;
            local.swmgdb.SwaggerUi = local.SwaggerUi;
        }());
        // init swagger-api
        local.swmgdb.apiUpdate({});
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
        // init swagger-mongodb
        local.swmgdb = {
            cacheDict: {
                collection: {},
                methodPath: {}
            },
            local: local
        };



/* jslint-indent-begin 8 */
/*jslint maxlen: 104*/
local.swmgdb.crudSwaggerJson = { paths: {
    '/{{schemaName}}/crudCountByQuery': { get: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudCountByQuery',
        parameters: [{
            description: 'mongodb query param',
            default: '{}',
            format: 'json',
            in: 'query',
            name: 'query',
            type: 'string'
        }],
        summary: 'count {{schemaName}} objects by query',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudCreateOne': { post: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudCreateOne',
        parameters: [{
            description: '{{schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{schemaName}}' }
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'create one {{schemaName}} object',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudDeleteByIdOne/{id}': { delete: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudDeleteByIdOne',
        parameters: [{
            description: '{{schemaName}} id',
            in: 'path',
            name: 'id',
            required: true,
            type: 'string'
        }],
        summary: 'delete one {{schemaName}} object by id',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudExistsByIdOne/{id}': { get: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudExistsByIdOne',
        parameters: [{
            description: '{{schemaName}} id',
            in: 'path',
            name: 'id',
            required: true,
            type: 'string'
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'check if {{schemaName}} object exists by id',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudGetByIdOne/{id}': { get: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudGetByIdOne',
        parameters: [{
            description: '{{schemaName}} id',
            in: 'path',
            name: 'id',
            required: true,
            type: 'string'
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'get one {{schemaName}} object by id',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudGetByQueryMany': { get: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudGetByQueryMany',
        parameters: [{
            description: 'mongodb query param',
            default: '{}',
            format: 'json',
            in: 'query',
            name: 'query',
            required: true,
            type: 'string'
        }, {
            description: 'mongodb fields param',
            default: '{}',
            format: 'json',
            in: 'query',
            name: 'fields',
            type: 'string'
        }, {
            description: 'mongodb cursor hint param',
            default: '{}',
            format: 'json',
            in: 'query',
            name: 'hint',
            type: 'string'
        }, {
            description: 'mongodb cursor limit param',
            default: 10,
            in: 'query',
            name: 'limit',
            required: true,
            type: 'integer'
        }, {
            description: 'mongodb cursor sort param',
            default: '{"_timeModified":-1}',
            format: 'json',
            in: 'query',
            name: 'sort',
            type: 'string'
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'get many {{schemaName}} objects by query',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudReplaceOne': { put: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudReplaceOne',
        parameters: [{
            description: '{{schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{schemaName}}' }
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'replace one {{schemaName}} object',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudReplaceOrCreateOne': { put: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudReplaceOrCreateOne',
        parameters: [{
            description: '{{schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{schemaName}}' }
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'replace or create one {{schemaName}} object',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudUpdateOne': { patch: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudUpdateOne',
        parameters: [{
            description: '{{schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{schemaName}}' }
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'update one {{schemaName}} object',
        tags: ['{{schemaName}}']
    } },
    '/{{schemaName}}/crudUpdateOrCreateOne': { patch: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudUpdateOrCreateOne',
        parameters: [{
            description: '{{schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{schemaName}}' }
        }],
        responses: { 200: {
            description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
            schema: { $ref: '#/definitions/JsonApiResponseData{{schemaName}}' }
        } },
        summary: 'update or create one {{schemaName}} object',
        tags: ['{{schemaName}}']
    } }
// init default definitions
}, definitions: {
    'JsonApiResponseData{{schemaName}}': {
        properties: { data: {
            items: { $ref: '#/definitions/{{schemaName}}' },
            type: 'array'
        } },
        'x-inheritList': [{ $ref: '#/definitions/JsonApiResponseData' }]
    }
} };
/* jslint-indent-end */



    }());
    return local;
}())));
