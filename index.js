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
        local.swmg.normalizeErrorJsonApi = function (error) {
            /*
             * this function will normalize the error to jsonapi format,
             * http://jsonapi.org/format/#errors
             */
            error.status = Number(error.status) || 500;
            error.errors = error.errors || [{
                code: error.code,
                message: error.message,
                title: error.title,
                detail: error.stack,
                status: error.status
            }];
            return local.swmg.normalizeIdSwagger(error);
        };

        local.swmg.normalizeIdMongodb = function (data) {
            /*
             * this function will recursively convert the property id to _id
             */
            local.utility2.objectTraverse(data, function (element) {
                if (element && element.id) {
                    element._id = element._id || element.id;
                    delete element.id;
                }
            });
            return data;
        };

        local.swmg.normalizeIdSwagger = function (data) {
            /*
             * this function will recursively convert the property _id to id
             */
            local.utility2.objectTraverse(data, function (element) {
                if (element && element._id) {
                    element.id = element.id || element._id;
                    delete element._id;
                }
            });
            return data;
        };

        local.swmg.schemaDereference = function ($ref) {
            /*
             * this function will try to dereference the schema from $ref
             */
            try {
                return local.swmg.swaggerJson
                    .definitions[(/^\#\/definitions\/(\w+)$/).exec($ref)[1]];
            } catch (ignore) {
            }
        };

        local.swmg.validateParameters = function (options) {
            /*
             * this function will validate options.data against options.parameters
             */
            var data, key;
            try {
                data = options.data;
                // validate data
                local.utility2.assert(data && typeof data === 'object', data);
                options.parameters.forEach(function (param) {
                    key = param.name;
                    local.swmg.validateProperty({
                        data: data[key],
                        key: key,
                        modeNoRequired: options.modeNoRequired,
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

        local.swmg.validateProperty = function (options) {
            /*
             * this function will validate options.data against options.property
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
                if (options.required && !options.modeNoRequired) {
                    throw new Error('required "' + options.key + ':' + format +
                        '" property cannot be null or undefined');
                }
                return;
            }
            property = options.property;
            // init type
            type = property.$ref || (property.schema && property.schema.$ref);
            if (type) {
                local.swmg.validateSchema({
                    circularList: options.circularList,
                    data: data,
                    schema: local.swmg.schemaDereference(type)
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
            // https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md
            // #data-types
            switch (type) {
            case 'array':
                assert(Array.isArray(data));
                // recurse - validate elements in list
                data.forEach(function (element) {
                    local.swmg.validateProperty({
                        circularList: options.circularList,
                        data: element,
                        key: options.key,
                        modeNoRequired: options.modeNoRequired,
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

        local.swmg.validateSchema = function (options) {
            /*
             * this function will validate options.data against options.schema
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
                    local.swmg.validateProperty({
                        circularList: options.circularList,
                        data: data[key],
                        depth: options.depth - 1,
                        key: key,
                        modeNoRequired: options.modeNoRequired,
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

        local.swmg.validateSwaggerJson = function (swaggerJson) {
            /*
             * this function will validate the entire swagger json object
             */
            local.swagger_tools.v2.validate(
                // jsonCopy object to prevent side-effects
                local.utility2.jsonCopy(swaggerJson),
                function (error, result) {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    ['errors', 'warnings'].forEach(function (errorType) {
                        ((result && result[errorType]) || [
                        ]).slice(0, 8).forEach(function (element) {
                            console.error('swagger schema - ' + errorType.slice(0, -1) + ' - ' +
                                element.code + ' - ' + element.message + ' - ' +
                                JSON.stringify(element.path));
                        });
                    });
                    error = result && result.errors && result.errors[0];
                    // validate no error occurred
                    local.utility2.assert(!error, new Error(error && error.message));
                }
            );
        };
    }());
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        local.swmg._crudApi = function (options, onError) {
            /*
             * this function will run the low-level crud-api on the given options.data
             */
            var modeNext, onNext, tmp;
            modeNext = 0;
            onNext = local.utility2.onErrorWithStack(function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // validate parameters
                        local.swmg.validateParameters({
                            data: options.data,
                            key: options.schemaName + '.' + options.operationId,
                            parameters: options.parameters
                        });
                        // normalize id to mongodb format
                        local.swmg.normalizeIdMongodb(options);
                        // init body
                        options.data = options.data.body || options.data;
                        // init id
                        options.data._id =
                            String(options.data._id || local.utility2.uuidTime());
                        // init collection
                        options.collection =
                            local.swmg.cacheDict.collection[options.collectionName];
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
                        tmp = data && data._timeCreated;
                        switch (options.operationId) {
                        case 'crudCreateOne':
                            options.data._timeCreated = options.data._timeModified =
                                new Date().toISOString();
                            break;
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                        case 'crudUpdateOne':
                        case 'crudUpdateOrCreateOne':
                            options.data._timeCreated = options.data._timeModified =
                                new Date().toISOString();
                            if (tmp < options.data._timeCreated && new Date(tmp).getTime()) {
                                options.data._timeCreated = tmp;
                            }
                            break;
                        }
                        switch (options.operationId) {
                        case 'crudCountByQuery':
                            // count data
                            options.collection.count(
                                local.swmg.normalizeIdMongodb(JSON.parse(options.data.query)),
                                onNext
                            );
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
                            data = local.swmg.normalizeIdMongodb([
                                JSON.parse(options.data.query),
                                JSON.parse(options.data.fields),
                                {
                                    hint: JSON.parse(options.data.hint),
                                    limit: options.data.limit,
                                    skip: options.data.skip,
                                    sort: JSON.parse(options.data.sort)
                                }
                            ]);
                            // find data
                            options.cursor = options.collection.find(data[0], data[1], data[2]);
                            options.cursor.toArray(onNext);
                            break;
                        case 'crudGetDistinctValueByFieldMany':
                            // find data
                            options.collection.distinct(
                                options.data.field.replace((/^id$/), '_id'),
                                local.swmg.normalizeIdMongodb(JSON.parse(options.data.query)),
                                onNext
                            );
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
                            onNext(new Error('undefined crud operation - ' +
                                options.schemaName + '.' + options.operationId));
                        }
                        break;
                    case 3:
                        // jsonCopy object to prevent side-effects
                        data = local.utility2.jsonCopy(data);
                        options.response = { _id: options.data._id };
                        switch (options.operationId) {
                        case 'crudCountByQuery':
                        case 'crudGetByIdOne':
                            options.response.data = [data];
                            break;
                        case 'crudGetDistinctValueByFieldMany':
                        case 'crudGetByQueryMany':
                            options.response.data = data;
                            break;
                        case 'crudCreateOne':
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                        case 'crudUpdateOne':
                        case 'crudUpdateOrCreateOne':
                            options.response.meta = data;
                            if (!options.response.meta.n) {
                                onNext(new Error('crud operation failed'));
                                return;
                            }
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
                        // jsonCopy object to prevent side-effects
                        options.response.data = [local.utility2.jsonCopy(data)];
                        onNext();
                        break;
                    default:
                        if (error) {
                            error._id = options.data._id;
                            error.meta = options.response && options.response.meta;
                            error = onError(local.swmg.normalizeErrorJsonApi(error));
                        }
                        // normalize id to swagger format
                        onError(error, local.swmg.normalizeIdSwagger(options.response));
                    }
                }, onNext);
            });
            onNext();
        };

        local.swmg.apiUpdate = function (options) {
            /*
             * this function will update the api
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
                        JSON.stringify(local.swmg.crudSwaggerJson)
                            .replace((/\{\{collectionName\}\}/g), collectionName)
                            .replace((/\{\{schemaName\}\}/g), schemaName)
                    ), 2);
                }
                // update cacheDict.collection
                local.utility2.taskRunOrSubscribe({
                    key: 'swagger-mongodb.mongodbConnect'
                }, function () {
                    local.swmg.cacheDict.collection[collectionName] =
                        local.swmg.db.collection(collectionName);
                });
            });
            // update paths
            Object.keys(options.paths).forEach(function (path) {
                Object.keys(options.paths[path]).forEach(function (method) {
                    // init methodPath.responses
                    methodPath = local.utility2.objectSetDefault(options.paths[path][method], {
                        _method: method,
                        _path: path,
                        parameters: [],
                        responses: {
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
                        },
                        tags: []
                    }, 2);
                    // update cacheDict.methodPath
                    local.swmg.cacheDict.methodPath[method.toUpperCase() + ' ' + path.replace(
                        (/\{.*/),
                        function (match0) {
                            return match0.replace((/[^\/]+/), '');
                        }
                    )] = methodPath;
                });
            });
            // update and save tags
            tmp = {};
            [local.swmg.swaggerJson.tags, options.tags].forEach(function (tags) {
                (tags || []).forEach(function (element) {
                    tmp[element.name] = element;
                });
            });
            tmp = Object.keys(tmp).sort().map(function (key) {
                return tmp[key];
            });
            // update swaggerJson with options, with underscored keys removed
            local.utility2.objectSetOverride(
                local.swmg.swaggerJson,
                local.utility2.objectTraverse(
                    // jsonCopy object to prevent side-effects
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
            local.swmg.swaggerJson.tags = tmp;
            // init properties from x-inheritList
            [0, 1, 2, 3].forEach(function () {
                Object.keys(local.swmg.swaggerJson.definitions).forEach(function (schema) {
                    schema = local.swmg.swaggerJson.definitions[schema];
                    // jsonCopy object to prevent side-effects
                    local.utility2.jsonCopy(schema['x-inheritList'] || [])
                        .reverse()
                        .forEach(function (element) {
                            local.utility2.objectSetDefault(schema, {
                                properties:
                                    local.swmg.schemaDereference(element.$ref).properties
                            }, 2);
                        });
                });
            });
            // jsonCopy object to prevent side-effects
            local.swmg.swaggerJson =
                JSON.parse(local.utility2.jsonStringifyOrdered(local.swmg.swaggerJson));
            // validate swaggerJson
            local.swmg.validateSwaggerJson(local.swmg.swaggerJson);
            // init crud-api
            local.swmg.api = new local.swmg.SwaggerClient({
                url: 'http://localhost:' + local.utility2.serverPortInit()
            });
            local.swmg.api.buildFromSpec(local.utility2.jsonCopy(local.swmg.swaggerJson));
        };

        local.swmg.middleware = function (request, response, nextMiddleware) {
            /*
             * this function will run the main swagger-middleware
             */
            var modeNext, onNext, onParallel, tmp;
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
    // if request.url is not prefixed with swaggerJson.basePath, then default to nextMiddleware
    if (request.urlParsed.pathnameNormalized.indexOf(local.swmg.swaggerJson.basePath) === 0) {
        local.utility2.serverRespondHeadSet(request, response, null, {
            'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
            // enable cors
            // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
            'Access-Control-Allow-Origin': '*',
            // init content-type
            'Content-Type': 'application/json; charset=UTF-8'
        });
        // init swmgPathname
        request.swmgPathname = request.method + ' ' + request.urlParsed.pathnameNormalized
            .replace(local.swmg.swaggerJson.basePath, '');
        switch (request.swmgPathname) {
        case 'GET /swagger.json':
            response.end(JSON.stringify(local.swmg.swaggerJson));
            return;
        }
        // init swmgMethodPath
        while (true) {
            request.swmgMethodPath =
                local.swmg.cacheDict.methodPath[request.swmgPathname];
            // if can init swmgMethodPath, then continue to onNext
            if (request.swmgMethodPath) {
                onNext();
                return;
            }
            // if cannot init swmgMethodPath, then default to nextMiddleware
            if (request.swmgPathname === request.swmgPathnameOld) {
                break;
            }
            request.swmgPathnameOld = request.swmgPathname;
            request.swmgPathname =
                request.swmgPathname.replace((/\/[^\/]+?(\/*?)$/), '/$1');
        }
    }
    // default to next middleware
    modeNext = Infinity;
    onNext();
    break;
case 2:
    onParallel = local.utility2.onParallel(onNext);
    onParallel.counter += 1;
    // init swmgParameters
    request.swmgParameters = {};
    // parse path param
    tmp = request.urlParsed.pathname.replace(local.swmg.swaggerJson.basePath, '').split('/');
    request.swmgMethodPath._path.split('/').forEach(function (key, ii) {
        if ((/^\{\S*?\}$/).test(key)) {
            request.swmgParameters[key.slice(1, -1)] = decodeURIComponent(tmp[ii]);
        }
    });
    request.swmgMethodPath.parameters.forEach(function (param) {
        switch (param.in) {
        // parse body param
        case 'body':
            onParallel.counter += 1;
            local.utility2.streamReadAll(request, local.utility2.onErrorJsonParse(
                function (error, data) {
                    request.swmgParameters[param.name] = data;
                    onParallel(error);
                }
            ));
            break;
        // parse header param
        case 'header':
            request.swmgParameters[param.name] = request.headers[param.name.toLowerCase()];
            break;
        // parse query param
        case 'query':
            request.swmgParameters[param.name] = request.urlParsed.query[param.name];
            break;
        }
        // init default param
        request.swmgParameters[param.name] =
            request.swmgParameters[param.name] || param.default;
    });
    onParallel();
    break;
case 3:
    request.swmgMethodPath.parameters.forEach(function (param) {
        tmp = request.swmgParameters[param.name];
        // init default value
        if (tmp === undefined) {
            // jsonCopy object to prevent side-effects
            request.swmgParameters[param.name] = local.utility2.jsonCopy(param.default);
        }
        // JSON.parse swmgParameters
        if (param.type !== 'string' && (typeof tmp === 'string' || Buffer.isBuffer(tmp))) {
            request.swmgParameters[param.name] = JSON.parse(tmp);
        }
    });
    // validate parameters
    local.swmg.validateParameters({
        data: request.swmgParameters,
        key: request.swmgPathname,
        parameters: request.swmgMethodPath.parameters
    });
    // run default crud-api
    if (request.swmgMethodPath._crudApi) {
        local.swmg._crudApi({
            collectionName: request.swmgMethodPath._collectionName,
            data: request.swmgParameters,
            operationId: request.swmgMethodPath.operationId,
            parameters: request.swmgMethodPath.parameters,
            schemaName: request.swmgMethodPath.tags[0]
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

        local.swmg.onMiddlewareError = function (error, request, response) {
            /*
             * this function will handle errors according to http://jsonapi.org/format/#errors
             */
            if (!error) {
                error = new Error('404 Not Found');
                error.status = 404;
            }
            error.message = request.method + ' ' + request.url + '\n' + error.message;
            error.stack = error.message + '\n' + error.stack;
            // print error.stack to stderr
            local.utility2.onErrorDefault(error);
            error = local.swmg.normalizeErrorJsonApi(error);
            local.utility2.serverRespondHeadSet(request, response, error.status, {});
            response.end(JSON.stringify(error));
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export swagger-mongodb
        window.swmg = local.swmg;
        // require modules
        local.utility2 = window.utility2;
        break;



    // run node js-env code
    case 'node':
        // export swagger-mongodb
        module.exports = local.swmg;
        module.exports.__dirname = __dirname;
        // require modules
        local.fs = require('fs');
        local.mongodb = require('mongodb-minimal');
        local.path = require('path');
        local.swagger_tools = require('swagger-ui-lite/swagger-tools-standalone-min.js');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.url = require('url');
        local.utility2 = require('utility2');
        local.vm = require('vm');
        // init swaggerJson
        local.swmg.swaggerJson = {
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
                description: 'demo of swagger-mongodb crud-api',
                title: 'swagger-mongodb api',
                version: '0'
            },
            paths: {},
            swagger: '2.0',
            tags: []
        };
        // init assets
        local.swmg['/assets/swagger-mongodb.js'] =
            local.fs.readFileSync(__filename, 'utf8');
        local.utility2.cacheDict.assets['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            .replace(
                'http://petstore.swagger.io/v2/swagger.json',
                local.swmg.swaggerJson.basePath + '/swagger.json'
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
            // swagger-hack - disable source-map
            .replace('//# sourceMappingURL=underscore-min.map', '//')
            // swagger-hack - save swaggerJson
            .replace(
                'this.apis = {};',
                'this.apis = {}; this.swaggerJson = JSON.parse(JSON.stringify(response))'
            )
            // swagger-hack - save pathMethod
            .replace(
                'this.parameterMacro = parent.parameterMacro',
                'this.pathMethod = JSON.parse(JSON.stringify(args)); ' +
                    'this.parameterMacro = parent.parameterMacro'
            )
            // swagger-hack - add modeErroData and validation handling
            .replace('var missingParams = this.getMissingParams(args);', String() +
                'if (opts.modeErrorData) { ' +
                    'var onError = success; ' +
                    'error = function (error) { onError(error.obj || error, error); }; ' +
                    'success = function (data) { onError(null, data); }; ' +
                '} ' +
                'try { ' +
                    'window.swmg && window.swmg.validateParameters({ ' +
                        'data: args, ' +
                        'key: this.operation.operationId, ' +
                        'modeNoRequired: this.pathMethod["x-modeNoRequired"],' +
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
            local.swmg.SwaggerClient = local.SwaggerClient;
            local.swmg.SwaggerUi = local.SwaggerUi;
        }());
        // init crud-api
        local.swmg.apiUpdate({});
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
        local.swmg = {
            cacheDict: {
                collection: {},
                methodPath: {}
            },
            local: local
        };



/* jslint-indent-begin 8 */
/*jslint maxlen: 104*/
local.swmg.crudSwaggerJson = { paths: {
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
    '/{{schemaName}}/crudGetDistinctValueByFieldMany': { get: {
        _collectionName: '{{collectionName}}',
        _crudApi: true,
        operationId: 'crudGetDistinctValueByFieldMany',
        parameters: [{
            description: 'mongodb query param',
            default: 'id',
            in: 'query',
            name: 'field',
            required: true,
            type: 'string'
        }, {
            description: 'mongodb query param',
            default: '{}',
            format: 'json',
            in: 'query',
            name: 'query',
            type: 'string'
        }],
        summary: 'get distinct {{schemaName}} values by field',
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
            description: 'mongodb cursor skip param',
            default: 0,
            in: 'query',
            name: 'skip',
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
    '/{{schemaName}}/crudUpdateOne': { put: {
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
        tags: ['{{schemaName}}'],
        'x-modeNoRequired': true
    } },
    '/{{schemaName}}/crudUpdateOrCreateOne': { put: {
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
        tags: ['{{schemaName}}'],
        'x-modeNoRequired': true
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
