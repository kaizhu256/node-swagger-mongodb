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

        local.swmg.normalizeParamDictSwagger = function (data, methodPath) {
            /*
             * this function will parse the data according to methodPath.parameters
             */
            var tmp;
            methodPath.parameters.forEach(function (paramDef) {
                tmp = data[paramDef.name];
                // init default value
                if (tmp === undefined) {
                    // jsonCopy object to prevent side-effects
                    data[paramDef.name] = local.utility2.jsonCopy(paramDef.default);
                }
                // parse csv array
                if (paramDef.type === 'array' &&
                        paramDef.collectionFormat &&
                        typeof tmp === 'string') {
                    switch (paramDef.collectionFormat) {
                    case 'csv':
                        tmp = tmp.split(',');
                        break;
                    case 'pipes':
                        tmp = tmp.split('|');
                        break;
                    case 'ssv':
                        tmp = tmp.split(' ');
                        break;
                    case 'tsv':
                        tmp = tmp.split('\t');
                        break;
                    }
                }
                // JSON.parse swmgParamDict
                if (paramDef.type !== 'string' &&
                        (typeof tmp === 'string' ||
                        (local.modeJs === 'node' && Buffer.isBuffer(tmp)))) {
                    try {
                        tmp = JSON.parse(tmp);
                    } catch (ignore) {
                    }
                }
                data[paramDef.name] = tmp;
            });
            return data;
        };

        local.swmg.onErrorJsonapi = function (options, onError) {
            /*
             * this function will convert the error and data to jsonapi format,
             * http://jsonapi.org/format/#errors
             * and pass them to onError
             */
            return function (error, data) {
                if (typeof options === 'function') {
                    options = options();
                }
                options = options || {};
                options.id = options.id || local.utility2.uuidTime();
                // handle error
                if (error) {
                    if (error.errors && Array.isArray(error.errors) && error.errors[0]) {
                        onError(error);
                        return;
                    }
                    // prepend mongodb-errmsg
                    if (error.errmsg) {
                        local.utility2.errorMessagePrepend(error, error.errmsg + '\n');
                    }
                    options.message = error.message;
                    options.stack = error.stack;
                    options.statusCode = Number(error.statusCode) || 500;
                    options.errors = local.utility2
                        .jsonCopy(local.swmg.normalizeIdSwagger(error));
                    local.utility2.objectSetDefault(options.errors, {
                        code: options.statusCode,
                        detail: options.stack,
                        id: options.id,
                        message: options.message
                    });
                    options.errors.code = String(options.errors.code);
                    options.errors.detail = String(options.errors.detail);
                    options.errors.id = String(options.errors.id);
                    options.errors.message = String(options.errors.message);
                    options.errors = [options.errors];
                    onError(options);
                    return;
                }
                // handle data
                options.data = data;
                local.swmg.normalizeIdSwagger(options);
                if (!Array.isArray(options.data)) {
                    options.data = [options.data];
                }
                onError(null, options);
            };
        };

        local.swmg.schemaDereference = function ($ref) {
            /*
             * this function will try to dereference the schema from $ref
             */
            try {
                return ((local.global.swaggerUi &&
                    local.global.swaggerUi.api &&
                    local.global.swaggerUi.api.swaggerJson) ||
                    local.swmg.swaggerJson)
                    .definitions[(/^\#\/definitions\/(\w+)$/).exec($ref)[1]];
            } catch (ignore) {
            }
        };

        local.swmg.validateByParamDefList = function (options) {
            /*
             * this function will validate options.data against options.paramDefList
             */
            var data, key;
            try {
                data = options.data;
                // validate data
                local.utility2.assert(data && typeof data === 'object', data);
                (options.paramDefList || []).forEach(function (paramDef) {
                    key = paramDef.name;
                    local.swmg.validateByPropertyDef({
                        data: data[key],
                        key: key,
                        propertyDef: paramDef,
                        required: paramDef.required
                    });
                });
            } catch (errorCaught) {
                local.utility2.errorMessagePrepend(errorCaught, '"' + options.key + '.' + key +
                    '" - ');
                throw errorCaught;
            }
        };

        local.swmg.validateByPropertyDef = function (options) {
            /*
             * this function will validate options.data against options.propertyDef
             */
            var assert, data, propertyDef, tmp;
            assert = function (valid) {
                if (!valid) {
                    throw new Error('invalid "' + options.key + ':' + (propertyDef.format ||
                        propertyDef.type) + '" property - ' + JSON.stringify(data));
                }
            };
            data = options.data;
            propertyDef = options.propertyDef;
            // validate undefined data
            if (data === null || data === undefined) {
                if (options.required) {
                    throw new Error('required "' + options.key + ':' + (propertyDef.format ||
                        propertyDef.type) + '" property cannot be null or undefined');
                }
                return;
            }
            // validate schema
            tmp = propertyDef.$ref || (propertyDef.schema && propertyDef.schema.$ref);
            if (tmp) {
                local.swmg.validateBySchema({
                    circularList: options.circularList,
                    data: data,
                    key: tmp,
                    schema: local.swmg.schemaDereference(tmp)
                });
                return;
            }
            // init circularList
            if (data && typeof data === 'object') {
                options.circularList = options.circularList || [];
                if (options.circularList.indexOf(data) >= 0) {
                    return;
                }
                options.circularList.push(data);
            }
            // validate propertyDef embedded in propertyDef.schema.type
            if (!propertyDef.type && propertyDef.schema && propertyDef.schema.type) {
                propertyDef = propertyDef.schema;
            }
            // validate propertyDef.type
            // https://github.com/swagger-api/swagger-spec/blob/master/versions/2.0.md
            // #data-types
            switch (propertyDef.type) {
            case 'array':
                assert(Array.isArray(data) && propertyDef.items);
                // recurse - validate elements in list
                data.forEach(function (element) {
                    local.swmg.validateByPropertyDef({
                        circularList: options.circularList,
                        data: element,
                        key: options.key,
                        propertyDef: propertyDef.items
                    });
                });
                break;
            case 'boolean':
                assert(typeof data === 'boolean');
                break;
            case 'integer':
                assert(typeof data === 'number' && isFinite(data) && (data | 0) === data);
                switch (propertyDef.format) {
                case 'int32':
                case 'int64':
                    break;
                }
                break;
            case 'number':
                assert(typeof data === 'number' && isFinite(data));
                switch (propertyDef.format) {
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
                switch (propertyDef.format) {
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

        local.swmg.validateBySchema = function (options) {
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
                switch (options.key) {
                // ignore undefined schema
                case '#/definitions/Undefined':
                    return;
                }
                local.utility2.assert(data && typeof data === 'object', 'invalid data ' + data);
                schema = options.schema;
                // validate schema
                local.utility2.assert(
                    schema && typeof schema === 'object',
                    'invalid schema ' + schema
                );
                Object.keys(schema.properties || {}).forEach(function (_) {
                    key = _;
                    local.swmg.validateByPropertyDef({
                        circularList: options.circularList,
                        data: data[key],
                        depth: options.depth - 1,
                        key: key,
                        propertyDef: schema.properties[key],
                        required: schema.required && schema.required.indexOf(key) >= 0
                    });
                });
            } catch (errorCaught) {
                local.utility2.errorMessagePrepend(errorCaught, '"' + options.key + '.' + key +
                    '" - ');
                throw errorCaught;
            }
        };

        local.swmg.validateBySwagger = function (options) {
            /*
             * this function will validate the entire swagger json object
             */
            local.swagger_tools.v2.validate(
                // jsonCopy object to prevent side-effects
                local.utility2.jsonCopy(options),
                function (error, result) {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    ['errors', 'undefined', 'warnings'].forEach(function (errorType) {
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
            var modeNext, onNext;
            options.onError2 = local.swmg.onErrorJsonapi(function () {
                return options.response;
            }, onError);
            modeNext = 0;
            onNext = local.utility2.onErrorWithStack(function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // jsonCopy object to prevent side-effects
                        options.data = local.utility2.jsonCopy(options.data);
                        // validate params
                        local.swmg.validateByParamDefList({
                            data: options.data,
                            key: options.schemaName + '.' + options.operationId,
                            paramDefList: options.paramDefList
                        });
                        // convert id to mongodb format
                        local.swmg.normalizeIdMongodb(options);
                        // init body
                        options.data.body = options.data.body || {};
                        // init id
                        options.data._id = options.data.body._id =
                            String(options.data.body._id ||
                                options.data._id ||
                                local.utility2.uuidTime());
                        options.optionsId = options.optionsId || { _id: options.data._id };
                        options.optionsIdKey = Object.keys(options.optionsId)[0];
                        // init collection
                        options.collection =
                            local.swmg.cacheDict.collection[options.collectionName];
                        // init response
                        options.response = { _id: options.data._id };
                        // init _timeCreated
                        switch (options.operationId) {
                        case 'crudUpdateOne':
                            options.collection
                                .findOne(options.optionsId, { _timeCreated: 1 }, onNext);
                            return;
                        }
                        onNext();
                        break;
                    case 2:
                        // init _timeCreated and _timeModified
                        options.tmp = data && data._timeCreated;
                        switch (options.operationId) {
                        case 'crudCreateOne':
                        case 'crudReplaceOne':
                            options.data.body._timeCreated =
                                options.data.body._timeModified = new Date().toISOString();
                            break;
                        case 'crudUpdateOne':
                            options.data.body._timeCreated =
                                options.data.body._timeModified = new Date().toISOString();
                            if (options.tmp < options.data.body._timeCreated &&
                                    new Date(options.tmp).getTime()) {
                                options.data.body._timeCreated = options.tmp;
                            }
                            break;
                        }
                        switch (options.operationId) {
                        case 'crudAggregateMany':
                            // aggregate data
                            options.collection.aggregate(local.swmg
                                .normalizeIdMongodb(options.data.body), onNext);
                            break;
                        case 'crudCountByQueryOne':
                            // count data
                            options.collection.count(local.swmg
                                .normalizeIdMongodb(JSON.parse(options.data.query)), onNext);
                            break;
                        case 'crudCreateOne':
                            // insert data
                            options.collection.insert(options.data.body, onNext);
                            break;
                        case 'crudDeleteByIdOne':
                            // delete data
                            options.collection.removeOne(options.optionsId, onNext);
                            break;
                        case 'crudDeleteByQueryMany':
                            // delete data
                            options.collection.remove(local.swmg
                                .normalizeIdMongodb(JSON.parse(options.data.query)), onNext);
                            break;
                        case 'crudExistsByIdOne':
                            // find data
                            options.collection.findOne(options.optionsId, { _id: 1 }, onNext);
                            break;
                        case 'crudGetByIdOne':
                            // find data
                            options.collection.findOne(options.optionsId, onNext);
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
                        case 'crudGetDistinctValueByPropertyMany':
                            // find data
                            options.collection.distinct(
                                options.data.field.replace((/^id$/), '_id'),
                                local.swmg.normalizeIdMongodb(JSON.parse(options.data.query)),
                                onNext
                            );
                            break;
                        case 'crudCreateMany':
                        case 'crudReplaceMany':
                            // insert / replace data
                            if (!options.data.body.length) {
                                options.response.data = [];
                                modeNext = Infinity;
                                onNext();
                                break;
                            }
                            options.bulk = options.collection.initializeOrderedBulkOp();
                            options.data.body.forEach(function (element) {
                                // init id
                                element._id = element._id || local.utility2.uuidTime();
                                element[options.optionsIdKey] = element[options.optionsIdKey] ||
                                    element._id;
                                // init _timeCreated and _timeModified
                                element._timeCreated =
                                    element._timeModified = new Date().toISOString();
                                switch (options.operationId) {
                                case 'crudCreateMany':
                                    // insert data
                                    options.bulk.insert(element);
                                    break;
                                case 'crudReplaceMany':
                                    options.bulkFindQuery = {};
                                    options.bulkFindQuery[options.optionsIdKey] =
                                        element[options.optionsIdKey];
                                    options.bulkFind = options.bulk.find(options.bulkFindQuery);
                                    // upsert data
                                    if (options.data.upsert) {
                                        options.bulkFind = options.bulkFind.upsert();
                                    }
                                    // replace data
                                    options.bulkFind.replaceOne(element);
                                    break;
                                }
                            });
                            options.bulk.execute(onNext);
                            break;
                        case 'crudReplaceOne':
                            // replace data
                            options.collection.update(options.optionsId, options.data.body, {
                                upsert: options.data.upsert
                            }, onNext);
                            break;
                        case 'crudUpdateOne':
                            // update data
                            options.collection.update(options
                                .optionsId, { $set: options.data.body }, {
                                    upsert: options.data.upsert
                                }, onNext);
                            break;
                        default:
                            onNext(new Error('undefined crud operation - ' +
                                options.schemaName + '.' + options.operationId));
                        }
                        break;
                    case 3:
                        // jsonCopy object to prevent side-effects
                        data = local.utility2.jsonCopy(data);
                        switch (options.operationId) {
                        case 'crudAggregateMany':
                        case 'crudCountByQueryOne':
                        case 'crudGetByIdOne':
                        case 'crudGetDistinctValueByPropertyMany':
                        case 'crudGetByQueryMany':
                            options.response.data = data;
                            break;
                        case 'crudCreateMany':
                        case 'crudReplaceMany':
                            options.response.meta = data;
                            options.collection.find({
                                _id: { $in: options.data.body.map(function (element) {
                                    return element._id;
                                }) }
                            }).toArray(onNext);
                            return;
                        case 'crudCreateOne':
                        case 'crudReplaceOne':
                        case 'crudUpdateOne':
                            options.response.meta = data;
                            if ((data.n || (data.result && data.result.n)) !== 1) {
                                onNext(new Error(options.operationId + ' failed'));
                                return;
                            }
                            options.collection.findOne(options.optionsId, onNext);
                            return;
                        case 'crudDeleteByIdOne':
                        case 'crudDeleteByQueryMany':
                            options.response.meta = data;
                            break;
                        case 'crudExistsByIdOne':
                            options.response.data = !!data;
                            break;
                        }
                        modeNext += 1;
                        onNext(error);
                        break;
                    case 4:
                        switch (options.operationId) {
                        case 'crudCreateMany':
                        case 'crudReplaceMany':
                            options.tmp = {};
                            data.forEach(function (element) {
                                options.tmp[element._id] = element;
                            });
                            options.response.data = options.data.body.map(function (element) {
                                return options.tmp[element._id];
                            });
                            break;
                        default:
                            // jsonCopy object to prevent side-effects
                            options.response.data = local.utility2.jsonCopy(data);
                        }
                        onNext();
                        break;
                    default:
                        options.onError2(error, options.response.data);
                    }
                }, options.onError2);
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
                var schema;
                schema = options.definitions[schemaName];
                schema._schemaName = schemaName;
                if (!schema._collectionName) {
                    return;
                }
                local.utility2.objectSetDefault(options, JSON.parse(JSON.stringify({
                    definitions: {
                        // init JsonapiResponse{{_schemaName}}
                        'JsonapiResponse{{_schemaName}}': {
                            properties: { data: {
                                items: { $ref: '#/definitions/{{_schemaName}}' },
                                type: 'array'
                            } },
                            'x-inheritList': [{ $ref: '#/definitions/JsonapiResponse' }]
                        }
                    }
                }).replace((/\{\{_schemaName\}\}/g), schemaName)), 2);
                // hack - init swaggerJson$$Dummy,
                // to pass validation warnings for auto-created schemas
                tmp = local.swmg.swaggerJson$$Dummy;
                local.utility2.objectSetOverride(tmp, JSON.parse(JSON.stringify({
                    paths: { '/$$Dummy/{{_schemaName}}': { get: {
                        responses: {
                            200: {
                                description: '',
                                schema: { $ref:
                                    '#/definitions/JsonapiResponse{{_schemaName}}' }
                            }
                        }
                    } } }
                }).replace((/\{\{_schemaName\}\}/g), schemaName)), 2);
                // init crud-api
                (schema._crudApiList || []).forEach(function (methodPath) {
                    methodPath = JSON.parse(local.swmg.cacheDict.methodPathCrudDefault[
                        methodPath
                    ]
                        .replace((/\{\{_collectionName\}\}/g), schema._collectionName)
                        .replace((/\{\{_crudApi\}\}/g), schema._crudApi)
                        .replace((/\{\{_schemaName\}\}/g), schema._schemaName));
                    options.paths[methodPath._path] = options.paths[methodPath._path] || {};
                    options.paths[methodPath._path][methodPath._method] = methodPath;
                });
                // init collectionName / crudApi / schemaName
                schema = options.definitions[schemaName] = JSON.parse(
                    JSON.stringify(schema)
                        .replace((/\{\{_collectionName\}\}/g), schema._collectionName)
                        .replace((/\{\{_crudApi\}\}/g), schema._crudApi)
                        .replace((/\{\{_schemaName\}\}/g), schema._schemaName)
                );
                // update cacheDict.collection
                local.utility2.onReady.counter += 1;
                local.utility2.taskRunOrSubscribe({
                    key: 'swagger-mongodb.mongodbConnect'
                }, function () {
                    local.swmg.collectionCreate(schema, local.utility2.onReady);
                });
            });
            // update paths
            Object.keys(options.paths).forEach(function (path) {
                Object.keys(options.paths[path]).forEach(function (method) {
                    methodPath = options.paths[path][method];
                    methodPath._method = method;
                    methodPath._path = path;
                    // init crud-api
                    tmp = methodPath._crudApi &&
                        local.swmg.cacheDict.methodPathCrudDefault[methodPath.operationId];
                    if (tmp) {
                        local.utility2.objectSetDefault(methodPath, JSON.parse(tmp), 2);
                    }
                    // init methodPath
                    local.utility2.objectSetDefault(methodPath, {
                        parameters: [],
                        responses: {
                            200: {
                                description: 'ok - ' +
                                    'http://jsonapi.org/format/#document-top-level',
                                schema: { $ref: '#/definitions/JsonapiResponse' }
                            }
                        },
                        tags: []
                    }, 2);
                    // init collectionName / crudApi / schemaName
                    local.utility2.objectSetOverride(methodPath, JSON.parse(
                        JSON.stringify(methodPath)
                            .replace((/\{\{_collectionName\}\}/g), methodPath._collectionName)
                            .replace((/\{\{_crudApi\}\}/g), methodPath._crudApi)
                            .replace((/\{\{_schemaName\}\}/g), methodPath._schemaName)
                    ), 1);
                    // update cacheDict.methodPath
                    local.swmg.cacheDict.methodPath[method.toUpperCase() + ' ' + path.replace(
                        (/\{.*/),
                        function (match0) {
                            return match0.replace((/[^\/]/g), '');
                        }
                    )] = JSON.stringify(methodPath);
                });
            });
            // merge tags
            tmp = {};
            // update tags from options._tagDict
            Object.keys(options._tagDict || {}).forEach(function (key) {
                tmp[key] = options._tagDict[key];
                tmp[key].name = key;
            });
            // update tags from options.tags
            [local.swmg.swaggerJson.tags, options.tags].forEach(function (tags) {
                (tags || []).forEach(function (element) {
                    tmp[element.name] = element;
                });
            });
            tmp = local.swmg.swaggerJson.tags = Object.keys(tmp).sort().map(function (key) {
                return tmp[key];
            });
            // update swaggerJson with options, with underscore keys removed
            local.utility2.objectSetOverride(
                local.swmg.swaggerJson,
                local.utility2.objectTraverse(
                    // jsonCopy object to prevent side-effects
                    local.utility2.jsonCopy(options),
                    function (element) {
                        if (element && typeof element === 'object') {
                            Object.keys(element).forEach(function (key) {
                                // security - remove underscore key
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
            local.swmg.swaggerJson = JSON.parse(local.utility2
                .jsonStringifyOrdered(local.utility2.jsonCopy(local.swmg.swaggerJson)));
            // validate swaggerJson
            local.swmg.validateBySwagger(local.utility2.objectSetDefault(
                local.utility2.jsonCopy(local.swmg.swaggerJson),
                local.swmg.swaggerJson$$Dummy,
                2
            ));
            // init crud-api
            local.swmg.api = new local.swmg.SwaggerClient({
                url: 'http://localhost:' + local.utility2.serverPortInit()
            });
            local.swmg.api.buildFromSpec(local.utility2.jsonCopy(local.swmg.swaggerJson));
        };

        local.swmg.collectionCreate = function (schema, onError) {
            /*
             * this function will create a mongodb collection
             */
            var collection, modeNext, onNext;
            modeNext = 0;
            onNext = function (error) {
                // validate no error occurred
                local.utility2.assert(!error, error);
                modeNext += 1;
                switch (modeNext) {
                case 1:
                    collection = local.swmg.cacheDict.collection[schema._collectionName] =
                        local.swmg.db.collection(schema._collectionName);
                    // if $npm_config_mode_mongodb_readonly, then return this function
                    if (local.utility2.envDict.npm_config_mode_mongodb_readonly ||
                            schema._collectionReadonly) {
                        onError();
                        return;
                    }
                    // drop collection on init
                    if (schema._collectionDrop) {
                        console.warn('dropping collection ' + schema._collectionName + ' ...');
                        local.swmg.db.command({ drop: schema._collectionName }, function () {
                            onNext();
                        });
                        return;
                    }
                    onNext();
                    return;
                case 2:
                    // create collection
                    if (schema._collectionCreate) {
                        local.swmg.db.createCollection(
                            schema._collectionName,
                            schema._collectionCreate,
                            function () {
                                // convert existing collection to capped collection
                                collection.isCapped(function (error, data) {
                                    if (!error && !data && schema._collectionCreate.capped) {
                                        local.swmg.db.command({
                                            convertToCapped: schema._collectionName,
                                            size: schema._collectionCreate.size
                                        }, onNext);
                                        return;
                                    }
                                    onNext();
                                });
                            }
                        );
                        return;
                    }
                    onNext();
                    return;
                case 3:
                    // create index
                    if (schema._collectionCreateIndexList) {
                        local.swmg.db.command({
                            createIndexes: schema._collectionName,
                            indexes: schema._collectionCreateIndexList
                        }, onNext);
                        return;
                    }
                    onNext();
                    return;
                case 4:
                    // upsert fixtures
                    local.swmg._crudApi({
                        collectionName: schema._collectionName,
                        data: {
                            body: local.utility2.jsonCopy(schema._collectionFixtureList || []),
                            upsert: true
                        },
                        operationId: 'crudReplaceMany',
                        schemaName: schema._schemaName
                    }, onNext);
                    return;
                default:
                    onError();
                }
            };
            onNext();
        };

        local.swmg.middlewareBodyParse = function (request, response, nextMiddleware) {
            /*
             * this function will parse the request-body
             */
            // jslint-hack
            local.utility2.nop(response);
            local.utility2.testTryCatch(function () {
                if (request.swmgBodyParsed) {
                    nextMiddleware();
                    return;
                }
                request.swmgBodyParsed = String(request.bodyRaw);
                switch ((/[^;]*/).exec(request.headers['content-type'] || '')[0]) {
                case 'application/x-www-form-urlencoded':
                    request.swmgBodyParsed =
                        local.url.parse('?' + request.swmgBodyParsed, true).query;
                    break;
                default:
                    try {
                        request.swmgBodyParsed = JSON.parse(request.swmgBodyParsed);
                    } catch (ignore) {
                    }
                }
                nextMiddleware();
            }, nextMiddleware);
        };

        local.swmg.middlewareError = function (error, request, response) {
            /*
             * this function will handle errors according to http://jsonapi.org/format/#errors
             */
            if (!error) {
                error = new Error('404 Not Found');
                error.statusCode = 404;
            }
            local.swmg.onErrorJsonapi(null, function (error) {
                local.utility2.serverRespondHeadSet(request, response, error.statusCode, {});
                // debug statusCode / method / url
                local.utility2.errorMessagePrepend(error, response.statusCode + ' ' +
                    request.method + ' ' + request.url + '\n');
                // print error.stack to stderr
                local.utility2.onErrorDefault(error);
                response.end(JSON.stringify(error));
            })(error);
        };

        local.swmg.middlewareSwagger = function (request, response, nextMiddleware) {
            /*
             * this function will run the main swagger-mongodb middleware
             */
            var modeNext, onNext, tmp;
            modeNext = 0;
            onNext = function (error) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // if request.url is not prefixed with swaggerJson.basePath,
                        // then default to nextMiddleware
                        if (request.urlParsed.pathnameNormalized
                                .indexOf(local.swmg.swaggerJson.basePath) !== 0) {
                            modeNext = Infinity;
                            onNext();
                            return;
                        }
                        // init swmgPathname
                        request.swmgPathname = request.method + ' ' +
                            request.urlParsed.pathnameNormalized
                            .replace(local.swmg.swaggerJson.basePath, '');
                        switch (request.swmgPathname) {
                        // serve swagger.json
                        case 'GET /swagger.json':
                            response.end(JSON.stringify(local.swmg.swaggerJson));
                            return;
                        }
                        // init swmgMethodPath
                        while (true) {
                            request.swmgMethodPath =
                                local.swmg.cacheDict.methodPath[request.swmgPathname];
                            // if swmgMethodPath exists, then break and continue
                            if (request.swmgMethodPath) {
                                request.swmgMethodPath = JSON.parse(request.swmgMethodPath);
                                onNext();
                                break;
                            }
                            // if cannot init swmgMethodPath, then default to nextMiddleware
                            if (request.swmgPathname === request.swmgPathnameOld) {
                                modeNext = Infinity;
                                onNext();
                                break;
                            }
                            request.swmgPathnameOld = request.swmgPathname;
                            request.swmgPathname =
                                request.swmgPathname.replace((/\/[^\/]+?(\/*?)$/), '/$1');
                        }
                        break;
                    case 2:
                        // init swmgParamDict
                        request.swmgParamDict = {};
                        // parse path param
                        tmp = request.urlParsed.pathname
                            .replace(local.swmg.swaggerJson.basePath, '').split('/');
                        request.swmgMethodPath._path.split('/').forEach(function (key, ii) {
                            if ((/^\{\S*?\}$/).test(key)) {
                                request.swmgParamDict[key.slice(1, -1)] =
                                    decodeURIComponent(tmp[ii]);
                            }
                        });
                        request.swmgMethodPath.parameters.forEach(function (paramDef) {
                            switch (paramDef.in) {
                            // parse body param
                            case 'body':
                                request.swmgParamDict[paramDef.name] =
                                    request.swmgParamDict[paramDef.name] ||
                                    request.swmgBodyParsed;
                                break;
                            // parse formData param
                            case 'formData':
                                request.swmgParamDict[paramDef.name] =
                                    request.swmgParamDict[paramDef.name] ||
                                    request.swmgBodyParsed[paramDef.name];
                                break;
                            // parse header param
                            case 'header':
                                request.swmgParamDict[paramDef.name] =
                                    request.headers[paramDef.name.toLowerCase()];
                                break;
                            // parse query param
                            case 'query':
                                request.swmgParamDict[paramDef.name] =
                                    request.urlParsed.query[paramDef.name];
                                break;
                            }
                            // init default param
                            request.swmgParamDict[paramDef.name] =
                                request.swmgParamDict[paramDef.name] || paramDef.default;
                        });
                        onNext();
                        break;
                    case 3:
                        // normalize params
                        local.swmg.normalizeParamDictSwagger(request
                            .swmgParamDict, request.swmgMethodPath);
                        // validate params
                        local.swmg.validateByParamDefList({
                            data: request.swmgParamDict,
                            key: request.swmgPathname,
                            paramDefList: request.swmgMethodPath.parameters
                        });
                        // run default crud-api
                        if (request.swmgMethodPath._crudApi) {
                            local.swmg._crudApi({
                                collectionName: request.swmgMethodPath._collectionName,
                                data: request.swmgParamDict,
                                operationId: request.swmgMethodPath.operationId,
                                paramDefList: request.swmgMethodPath.parameters,
                                schemaName: request.swmgMethodPath._schemaName
                            }, function (error, data) {
                                if (!error && data) {
                                    response.end(JSON.stringify(data));
                                    return;
                                }
                                onNext(error);
                            });
                            return;
                        }
                        onNext();
                        break;
                    default:
                        nextMiddleware(error);
                    }
                }, nextMiddleware);
            };
            onNext();
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
                Array: { items: {}, type: 'array' },
                // http://jsonapi.org/format/#errors
                JsonapiError: {
                    properties: {
                        code: { type: 'string' },
                        detail: { type: 'string' },
                        id: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-resource-objects
                JsonapiResource: {
                    properties: {
                        id: { type: 'string' }
                    }
                },
                // http://jsonapi.org/format/#document-structure-top-level
                JsonapiResponse: {
                    properties: {
                        data: {
                            items: { $ref: '#/definitions/JsonapiResource' },
                            type: 'array'
                        },
                        errors: {
                            items: { $ref: '#/definitions/JsonapiError' },
                            type: 'array'
                        },
                        meta: { $ref: '#/definitions/Object' },
                        statusCode: { type: 'integer' }
                    }
                },
                // http://docs.mongodb.org/manual/reference/operator/aggregation/
                MongodbAggregationPipeline: {
                    properties: {
                        $group: { default: { "_id": "all", "count": { "$sum": 1 } } }
                    }
                },
                Object: { type: 'object' },
                Undefined: {}
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
        // hack - init swaggerJson$$Dummy to pass validation warnings for auto-created schemas
        local.swmg.swaggerJson$$Dummy = {
            definitions: {
                $$Dummy: {
                    properties: {
                        propArray: {
                            items: { $ref: '#/definitions/Array' },
                            type: 'array'
                        },
                        propMongodbAggregationPipeline: {
                            items: { $ref: '#/definitions/MongodbAggregationPipeline' },
                            type: 'array'
                        },
                        propObject: { items: { $ref: '#/definitions/Object' } },
                        propUndefined: { items: { $ref: '#/definitions/Undefined' } }
                    }
                },
                JsonapiResponse$$Dummy: {
                    properties: { data: {
                        items: { $ref: '#/definitions/$$Dummy' },
                        type: 'array'
                    } },
                    'x-inheritList': [{ $ref: '#/definitions/JsonapiResponse' }]
                }
            },
            paths: { '/$$Dummy': { get: {
                responses: {
                    200: {
                        description: '',
                        schema: { $ref: '#/definitions/JsonapiResponse$$Dummy' }
                    }
                }
            } } }
        };
        // init assets
        local.utility2.cacheDict.assets['/assets/swagger-mongodb.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.fs.readFileSync(__filename, 'utf8'),
                __filename,
                'swagger-mongodb'
            );
        local.utility2.cacheDict.assets['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            // swagger-hack - add extra assets
            .replace(
                "<script src='swagger-ui.rollup.js' type='text/javascript'></script>",
                "<script src='swagger-ui.rollup.js' type='text/javascript'></script>" +
                    '<script src="/assets/utility2.js"></script>' +
                    '<script src="/assets/swagger-mongodb.js"></script>'
            )
            // swagger-hack - update swagger.json url
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
            // swagger-hack - disable underscore-min.map
            .replace('//# sourceMappingURL=underscore-min.map', '')
            // swagger-hack - save swaggerJson
            .replace(
                'this.apis = {};',
                'this.apis = {}; this.swaggerJson = JSON.parse(JSON.stringify(response));'
            )
            // swagger-hack - disable missingParams validation handling
            .replace(
                'var missingParams = this.getMissingParams(args);',
                'var missingParams = [];'
            )
            // swagger-hack - add modeErroData and validation handling
            .replace('new SwaggerHttp().execute(obj, opts);', 'if (opts.modeErrorData) {' +
                    'var onError = success;' +
                    'error = function (error) {' +
                        'error = error.obj || error;' +
                        'error = error.data || error;' +
                        'try { error = JSON.parse(error) } catch (ignore) {}' +
                        'if (typeof error === "string") {' +
                            'error = { message: error };' +
                        '}' +
                        'onError(error);' +
                    '};' +
                    'success = function (data) { onError(null, data); };' +
                '}' +
                'try {' +
                    'if (window.swmg) {' +
                        'window.swmg.validateByParamDefList({' +
                            'data: window.swmg.normalizeParamDictSwagger(' +
                                'JSON.parse(JSON.stringify(args)),' +
                                'this' +
                            '),' +
                            'key: this.operation.operationId,' +
                            'paramDefList: this.parameters' +
                        '});' +
                    '}' +
                '} catch (errorCaught) {' +
                    'window.swmg.onErrorJsonapi(null, function (error) {' +
                        'console.error(error);' +
                        'obj.on.error({' +
                            'data: JSON.stringify(error),' +
                            'headers: { "Content-Type": "application/json" }' +
                        '});' +
                    '})(errorCaught);' +
                    'return;' +
                '}' +
                'new SwaggerHttp().execute(obj, opts);')
            // swagger-hack - handle json error
            .replace('new_err.status = res.status;', 'new_err.status = res.status;' +
                'if (res.body && res.body.message && res.body.stack) { err = res.body; }')
            // swagger-hack - disable online validation
            .replace("if ('validatorUrl' in opts.swaggerOptions) {", "if (true) {");
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
                local.utility2.ajax(self, local.utility2.onErrorDefault);
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
        // init api
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
        // init js-env
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
        local.swmg = { cacheDict: { collection: {}, methodPath: {} }, local: local };
/* jslint-indent-begin 8 */
/*jslint maxlen: 104*/
// init methodPathCrudDefault
local.swmg.cacheDict.methodPathCrudDefault = {
    crudAggregateMany: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'post',
        _path: '/{{_crudApi}}/crudAggregateMany',
        operationId: 'crudAggregateMany',
        parameters: [{
            description: 'mongodb aggregation array',
            in: 'body',
            name: 'body',
            required: true,
            schema: {
                items: { $ref: '#/definitions/MongodbAggregationPipeline' },
                type: 'array'
            }
        }],
        summary: 'aggregate many {{_schemaName}} objects',
        tags: ['{{_crudApi}}']
    },
    crudCountByQueryOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'get',
        _path: '/{{_crudApi}}/crudCountByQueryOne',
        operationId: 'crudCountByQueryOne',
        parameters: [{
            default: '{}',
            description: 'mongodb query param',
            format: 'json',
            in: 'query',
            name: 'query',
            type: 'string'
        }],
        summary: 'count many {{_schemaName}} objects by query',
        tags: ['{{_crudApi}}']
    },
    crudCreateMany: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'put',
        _path: '/{{_crudApi}}/crudCreateMany',
        operationId: 'crudCreateMany',
        parameters: [{
            description: '{{_schemaName}} object list',
            in: 'body',
            name: 'body',
            required: true,
            schema: { items: { $ref: '#/definitions/{{_schemaName}}' }, type: 'array' }
        }],
        summary: 'create many {{_schemaName}} objects in ordered list',
        tags: ['{{_crudApi}}']
    },
    crudCreateOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'post',
        _path: '/{{_crudApi}}/crudCreateOne',
        operationId: 'crudCreateOne',
        parameters: [{
            description: '{{_schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{_schemaName}}' }
        }],
        responses: {
            200: {
                description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
            }
        },
        summary: 'create one {{_schemaName}} object',
        tags: ['{{_crudApi}}']
    },
    crudDeleteByIdOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'delete',
        _path: '/{{_crudApi}}/crudDeleteByIdOne/{id}',
        operationId: 'crudDeleteByIdOne',
        parameters: [{
            description: '{{_schemaName}} id',
            in: 'path',
            name: 'id',
            required: true,
            type: 'string'
        }],
        summary: 'delete one {{_schemaName}} object by id',
        tags: ['{{_crudApi}}']
    },
    crudDeleteByQueryMany: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'delete',
        _path: '/{{_crudApi}}/crudDeleteByQueryMany',
        operationId: 'crudDeleteByQueryMany',
        parameters: [{
            default: '{"_id":{"$in":["id0","id1"]}}',
            description: 'mongodb query param',
            format: 'json',
            in: 'query',
            name: 'query',
            required: true,
            type: 'string'
        }],
        responses: {
            200: {
                description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
            }
        },
        summary: 'get many {{_schemaName}} objects by query',
        tags: ['{{_crudApi}}']
    },
    crudExistsByIdOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'get',
        _path: '/{{_crudApi}}/crudExistsByIdOne/{id}',
        operationId: 'crudExistsByIdOne',
        parameters: [{
            description: '{{_schemaName}} id',
            in: 'path',
            name: 'id',
            required: true,
            type: 'string'
        }],
        summary: 'check if one {{_schemaName}} object exists by id',
        tags: ['{{_crudApi}}']
    },
    crudGetByIdOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'get',
        _path: '/{{_crudApi}}/crudGetByIdOne/{id}',
        operationId: 'crudGetByIdOne',
        parameters: [{
            description: '{{_schemaName}} id',
            in: 'path',
            name: 'id',
            required: true,
            type: 'string'
        }],
        responses: {
            200: {
                description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
            }
        },
        summary: 'get one {{_schemaName}} object by id',
        tags: ['{{_crudApi}}']
    },
    crudGetByQueryMany: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'get',
        _path: '/{{_crudApi}}/crudGetByQueryMany',
        operationId: 'crudGetByQueryMany',
        parameters: [{
            default: '{}',
            description: 'mongodb query param',
            format: 'json',
            in: 'query',
            name: 'query',
            required: true,
            type: 'string'
        }, {
            default: '{}',
            description: 'mongodb fields param',
            format: 'json',
            in: 'query',
            name: 'fields',
            type: 'string'
        }, {
            default: '{}',
            description: 'mongodb cursor hint param',
            format: 'json',
            in: 'query',
            name: 'hint',
            type: 'string'
        }, {
            default: 10,
            description: 'mongodb cursor limit param',
            in: 'query',
            name: 'limit',
            required: true,
            type: 'integer'
        }, {
            default: 0,
            description: 'mongodb cursor skip param',
            in: 'query',
            name: 'skip',
            type: 'integer'
        }, {
            default: '{"_timeModified":-1}',
            description: 'mongodb cursor sort param',
            format: 'json',
            in: 'query',
            name: 'sort',
            type: 'string'
        }],
        responses: {
            200: {
                description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
            }
        },
        summary: 'get many {{_schemaName}} objects by query',
        tags: ['{{_crudApi}}']
    },
    crudGetDistinctValueByPropertyMany: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'get',
        _path: '/{{_crudApi}}/crudGetDistinctValueByPropertyMany',
        operationId: 'crudGetDistinctValueByPropertyMany',
        parameters: [{
            default: 'id',
            description: 'mongodb query param',
            in: 'query',
            name: 'field',
            required: true,
            type: 'string'
        }, {
            default: '{}',
            description: 'mongodb query param',
            format: 'json',
            in: 'query',
            name: 'query',
            type: 'string'
        }],
        summary: 'get many distinct {{_schemaName}} values by field',
        tags: ['{{_crudApi}}']
    },
    crudReplaceMany: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'put',
        _path: '/{{_crudApi}}/crudReplaceMany',
        operationId: 'crudReplaceMany',
        parameters: [{
            description: '{{_schemaName}} object list',
            in: 'body',
            name: 'body',
            required: true,
            schema: { items: { $ref: '#/definitions/{{_schemaName}}' }, type: 'array' }
        }, {
            default: false,
            description: 'upsert {{_schemaName}} object if it does not exist',
            in: 'query',
            name: 'upsert',
            type: 'boolean'
        }],
        summary: 'replace many {{_schemaName}} objects in ordered list',
        tags: ['{{_crudApi}}']
    },
    crudReplaceOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'put',
        _path: '/{{_crudApi}}/crudReplaceOne',
        operationId: 'crudReplaceOne',
        parameters: [{
            description: '{{_schemaName}} object',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/{{_schemaName}}' }
        }, {
            default: false,
            description: 'upsert {{_schemaName}} object if it does not exist',
            in: 'query',
            name: 'upsert',
            type: 'boolean'
        }],
        responses: {
            200: {
                description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
            }
        },
        summary: 'replace one {{_schemaName}} object',
        tags: ['{{_crudApi}}']
    },
    crudUpdateOne: {
        _collectionName: '{{_collectionName}}',
        _crudApi: '{{_crudApi}}',
        _method: 'put',
        _path: '/{{_crudApi}}/crudUpdateOne',
        operationId: 'crudUpdateOne',
        parameters: [{
            description: '{{_schemaName}} object with no validation check',
            in: 'body',
            name: 'body',
            required: true,
            schema: { $ref: '#/definitions/Object' }
        }, {
            default: false,
            description: 'upsert {{_schemaName}} object if it does not exist',
            in: 'query',
            name: 'upsert',
            type: 'boolean'
        }],
        responses: {
            200: {
                description: '200 ok - http://jsonapi.org/format/#document-structure-top-level',
                schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
            }
        },
        summary: 'update one {{_schemaName}} object',
        tags: ['{{_crudApi}}']
    }
};
/* jslint-indent-end */
        Object.keys(local.swmg.cacheDict.methodPathCrudDefault).forEach(function (key) {
            local.swmg.cacheDict.methodPathCrudDefault[key] =
                JSON.stringify(local.swmg.cacheDict.methodPathCrudDefault[key]);
        });
    }());
    return local;
}())));
