/*jslint
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
        local.optionsId = function (options) {
            /*
             * this function will init petstore id's
             */
            return local.utility2.objectSetDefault(options, {
                name: options.id,
                orderId: options.id,
                petId: options.id,
                photoUrls: [options.id],
                status: options.id,
                tags: [{ id: options.id, name: options.id }],
                username: options.id
            });
        };

        // init tests
        local.testCase_ajax_404 = function (options, onError) {
            /*
             * this function will test ajax's "404 not found" handling-behavior
             */
            // jslint-hack
            local.utility2.nop(options);
            // test '/_TestModel/undefined'
            local.utility2.ajax({ url: '/_TestModel/undefined' }, function (error) {
                local.utility2.testTryCatch(function () {
                    // validate error occurred
                    local.utility2.assert(error, error);
                    // validate 404 http statusCode
                    local.utility2.assert(error.statusCode === 404, error.statusCode);
                    onError();
                }, onError);
            });
        };

        local.testCase_crudCreateXxx_default = function (options, onError) {
            /*
             * this function will test crudCreateXxx's default handling-behavior
             */
            var api, modeNext, onError2, onNext, onParallel;
            if (!options) {
                onParallel = local.utility2.onParallel(onError);
                onParallel.counter += 1;
                [
                    '',
                    'pet',
                    'store',
                    'user'
                ].forEach(function (api) {
                    [
                        'crudCreateOne',
                        'crudReplaceOne',
                        'crudReplaceOrCreateOne',
                        'crudUpdateOne',
                        'crudUpdateOrCreateOne',
                        'updatePetWithForm'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudCreateXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId
                        }, onParallel);
                    });
                });
                onParallel();
                return;
            }
            onError2 = function (error, data) {
                if (error) {
                    // update error.message
                    local.utility2.errorMessagePrepend(error, options.api + '.' +
                        options.operationId + ' - ');
                }
                onError(error, data);
            };
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // init options
                        options.body = local.optionsId({
                            fieldExtra: 'hello',
                            fieldRequired: true,
                            id: options.id
                        });
                        options.modeErrorData = true;
                        // init api
                        options.api = options.api || '_TestModel';
                        api = local.swmg.api[options.api];
                        // if api does not have the operation, then skip testCase
                        if (!api[options.operationId]) {
                            onError2();
                            return;
                        }
                        // get object
                        api.crudGetByIdOne(local.optionsId({
                            id: options.id
                        }), options, onNext);
                        break;
                    case 2:
                        // validate object does not exist
                        local.utility2.assert(data.obj.data[0] === null, data.obj.data[0]);
                        // test createXxx's default handling-behavior
                        data = local.utility2.jsonCopy(options);
                        api[options.operationId](local.optionsId(data), options, onNext);
                        break;
                    case 3:
                        // validate object
                        data = data.obj.data[0];
                        options._timeCreated = data._timeCreated;
                        options._timeModified = data._timeModified;
                        switch (options.operationId) {
                        case 'updatePetWithForm':
                            local.utility2
                                .assert(data.fieldExtra === undefined, data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === undefined, data.fieldRequired);
                            local.utility2.assert(data.name === options.id, data.name);
                            local.utility2.assert(data.status === options.id, data.status);
                            break;
                        default:
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === true, data.fieldRequired);
                        }
                        // get object
                        api.crudGetByIdOne(local.optionsId({
                            id: options.id
                        }), options, onNext);
                        break;
                    case 4:
                        // validate object
                        data = data.obj.data[0];
                        local.utility2.assert(
                            data._timeCreated === options._timeCreated,
                            [data._timeCreated, options._timeCreated]
                        );
                        local.utility2.assert(
                            data._timeModified === options._timeModified,
                            [data._timeModified, options._timeModified]
                        );
                        switch (options.operationId) {
                        case 'updatePetWithForm':
                            local.utility2
                                .assert(data.fieldExtra === undefined, data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === undefined, data.fieldRequired);
                            local.utility2.assert(data.name === options.id, data.name);
                            local.utility2.assert(data.status === options.id, data.status);
                            break;
                        default:
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === true, data.fieldRequired);
                        }
                        if (options.modeNoDelete) {
                            onNext();
                            return;
                        }
                        // remove object by id
                        local.testCase_crudDeleteById_default(options, onNext);
                        break;
                    default:
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                        case 'crudUpdateOne':
                            // validate error occurred
                            local.utility2.assert(error, error);
                            error = null;
                            break;
                        }
                        onError2(error, options);
                        break;
                    }
                }, onError2);
            };
            onNext(options && options.error);
        };

        local.testCase_crudEcho_default = function (options, onError) {
            /*
             * this function will test crudEcho's default handling-behavior
             */
            // jslint-hack
            local.utility2.nop(options);
            local.swmg.api._TestModel.echo({
                id: 'test_' + local.utility2.uuidTime(),
                // test array-csv-param handling-behavior
                paramArrayCsv: 'aa,bb',
                // test array-pipes-param handling-behavior
                paramArrayPipes: 'aa|bb',
                // test array-ssv-param handling-behavior
                paramArraySsv: 'aa bb',
                // test array-tsv-param handling-behavior
                paramArrayTsv: 'aa\tbb',
                // test body-param handling-behavior
                paramBody: 'hello!',
                // test extra-param handling-behavior
                paramExtra: 'hello',
                // test header-param handling-behavior
                paramHeader: 'hello'
            }, { modeErrorData: true }, function (error, data) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate data
                    data = data.obj;
                    local.utility2.assert(local.utility2
                        .jsonStringifyOrdered(data) === JSON.stringify({
                            paramArrayCsv: ['aa', 'bb'],
                            paramArrayPipes: ['aa', 'bb'],
                            paramArraySsv: ['aa', 'bb'],
                            paramArrayTsv: ['aa', 'bb'],
                            paramBody: 'hello!',
                            paramExtra: 'hello',
                            paramExtra2: 'hello',
                            paramHeader: 'hello'
                        }), data);
                    onError();
                }, onError);
            });
        };

        local.testCase_crudGetXxx_default = function (options, onError) {
            /*
             * this function will test crudGetXxx's default handling-behavior
             */
            var api, modeNext, onError2, onNext, onParallel;
            if (!options) {
                onParallel = local.utility2.onParallel(onError);
                onParallel.counter += 1;
                [
                    '',
                    'pet',
                    'store',
                    'user'
                ].forEach(function (api) {
                    [
                        'customGetByIdOne',
                        'crudAggregateMany',
                        'crudCountByQueryOne',
                        'crudGetByIdOne',
                        'crudGetByQueryMany',
                        'crudGetDistinctValueByFieldMany',
                        'crudExistsByIdOne',
                        'findPetsByStatus',
                        'findPetsByTags',
                        'getInventory'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudGetXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId
                        }, onParallel);
                    });
                });
                onParallel();
                return;
            }
            onError2 = function (error, data) {
                if (error) {
                    // update error.message
                    local.utility2.errorMessagePrepend(error, options.api + '.' +
                        options.operationId + ' - ');
                }
                onError(error, data);
            };
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // init options
                        options.field = 'id';
                        options.limit = 2;
                        options.modeErrorData = true;
                        options.query = JSON.stringify({ id: options.id });
                        // init api
                        options.api = options.api || '_TestModel';
                        api = local.swmg.api[options.api];
                        // if api does not have the operation, then skip testCase
                        if (!api[options.operationId]) {
                            onError2();
                            return;
                        }
                        // create object
                        local.testCase_crudCreateXxx_default({
                            api: options.api,
                            id: options.id,
                            modeNoDelete: true,
                            operationId: 'crudCreateOne'
                        }, onNext);
                        break;
                    case 2:
                        // validate object exists
                        data = local.utility2.jsonCopy(options);
                        data.body = [{ $group: { "_id": "all", "count": { "$sum": 1 } } }];
                        data.tags = options.id;
                        api[options.operationId](local.optionsId(data), options, onNext);
                        break;
                    case 3:
                        // validate object exists
                        data = data.obj.data;
                        switch (options.operationId) {
                        case 'crudAggregateMany':
                        case 'crudGetDistinctValueByFieldMany':
                        case 'getInventory':
                            local.utility2.assert(data.length >= 1, data.length);
                            break;
                        default:
                            local.utility2.assert(data.length === 1, data.length);
                        }
                        local.utility2.assert(data[0], data[0]);
                        // remove object by id
                        local.testCase_crudDeleteById_default(options, onNext);
                        break;
                    default:
                        onError2(error);
                        break;
                    }
                }, onError2);
            };
            onNext(options && options.error);
        };

        local.testCase_crudDeleteById_default = function (options, onError) {
            /*
             * this function will test crudDeleteById's default handling-behavior
             */
            var api, modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // init options
                        options = options || {};
                        options.id = options.id || local.utility2.uuidTime();
                        options.modeErrorData = true;
                        // init api
                        options.api = options.api || '_TestModel';
                        api = local.swmg.api[options.api];
                        // remove object by id
                        api.crudDeleteByIdOne(local.optionsId({
                            id: options.id
                        }), options, onNext);
                        break;
                    case 2:
                        // validate object does not exist
                        api.crudGetByIdOne(local.optionsId({
                            id: options.id
                        }), options, onNext);
                        break;
                    case 3:
                        // validate object does not exist
                        local.utility2.assert(data.obj.data[0] === null, data.obj.data[0]);
                        onNext();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext(options && options.error);
        };

        local.testCase_crudUpdateXxx_default = function (options, onError) {
            /*
             * this function will test crudUpdateXxx's default handling-behavior
             */
            var api, modeNext, onError2, onNext, onParallel;
            if (!options) {
                onParallel = local.utility2.onParallel(onError);
                onParallel.counter += 1;
                [
                    '',
                    'pet',
                    'store',
                    'user'
                ].forEach(function (api) {
                    [
                        'crudReplaceOne',
                        'crudReplaceOrCreateOne',
                        'crudUpdateOne',
                        'crudUpdateOrCreateOne',
                        'updatePetWithForm'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudUpdateXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId
                        }, onParallel);
                    });
                });
                onParallel();
                return;
            }
            onError2 = function (error, data) {
                if (error) {
                    // update error.message
                    local.utility2.errorMessagePrepend(error, options.api + '.' +
                        options.operationId + ' - ');
                }
                onError(error, data);
            };
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // init options
                        options.body = local.optionsId({
                            fieldRequired: false,
                            id: options.id
                        });
                        options.modeErrorData = true;
                        // init api
                        options.api = options.api || '_TestModel';
                        api = local.swmg.api[options.api];
                        // if api does not have the operation, then skip testCase
                        if (!api[options.operationId]) {
                            onError2();
                            return;
                        }
                        // create object
                        local.testCase_crudCreateXxx_default({
                            api: options.api,
                            id: options.id,
                            modeNoDelete: true,
                            operationId: 'crudCreateOne'
                        }, onNext);
                        break;
                    case 2:
                        options._timeCreated = data._timeCreated;
                        options._timeModified = data._timeModified;
                        // test updateXxx's default handling-behavior
                        data = local.utility2.jsonCopy(options);
                        api[options.operationId](local.optionsId(data), options, onNext);
                        break;
                    case 3:
                        // validate object
                        data = data.obj.data[0];
                        local.utility2.assert(
                            data._timeCreated === options._timeCreated,
                            [data._timeCreated, options._timeCreated]
                        );
                        local.utility2.assert(
                            data._timeModified > options._timeModified,
                            [data._timeModified, options._timeModified]
                        );
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                            local.utility2
                                .assert(data.fieldExtra === undefined, data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === false, data.fieldRequired);
                            break;
                        case 'updatePetWithForm':
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === true, data.fieldRequired);
                            local.utility2.assert(data.name === options.id, data.name);
                            local.utility2.assert(data.status === options.id, data.status);
                            break;
                        default:
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === false, data.fieldRequired);
                        }
                        // get object
                        api.crudGetByIdOne(local.optionsId({
                            id: options.id
                        }), options, onNext);
                        break;
                    case 4:
                        // validate object
                        data = data.obj.data[0];
                        local.utility2.assert(
                            data._timeCreated === options._timeCreated,
                            [data._timeCreated, options._timeCreated]
                        );
                        local.utility2.assert(
                            data._timeModified > options._timeModified,
                            [data._timeModified, options._timeModified]
                        );
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                        case 'crudReplaceOrCreateOne':
                            local.utility2
                                .assert(data.fieldExtra === undefined, data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === false, data.fieldRequired);
                            break;
                        case 'updatePetWithForm':
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === true, data.fieldRequired);
                            local.utility2.assert(data.name === options.id, data.name);
                            local.utility2.assert(data.status === options.id, data.status);
                            break;
                        default:
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                            local.utility2
                                .assert(data.fieldRequired === false, data.fieldRequired);
                        }
                        // remove object by id
                        local.testCase_crudDeleteById_default(options, onNext);
                        break;
                    default:
                        onError2(error);
                        break;
                    }
                }, onError2);
            };
            onNext(options && options.error);
        };

        local.testCase_crudXxx_error = function (options, onError) {
            /*
             * this function will test crudXxx's error handling-behavior
             */
            var api, onParallel, optionsCopy;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            // init options
            options = {};
            options.modeErrorData = true;
            options.paramHeader = '1';
            // init api
            api = local.swmg.api._TestModel;
            // test api-error handling-behavior
            [
                'errorMiddleware',
                'errorUndefinedApi',
                'errorUndefinedCrud'
            ].forEach(function (operationId) {
                optionsCopy = local.utility2.jsonCopy(options);
                optionsCopy.id = 'test_' + local.utility2.uuidTime();
                optionsCopy.operationId = operationId;
                onParallel.counter += 1;
                api[optionsCopy.operationId](optionsCopy, optionsCopy, function (error) {
                    local.utility2.testTryCatch(function () {
                        // validate error occurred
                        local.utility2.assert(error, error);
                        onParallel();
                    }, onParallel);
                });
            });
            // test low-level ajax-error handling-behavior
            [{
                url: '/api/v0/_TestModel/errorUndefined'
            }].forEach(function (options) {
                onParallel.counter += 1;
                local.utility2.ajax(options, function (error) {
                    local.utility2.testTryCatch(function () {
                        // validate error occurred
                        local.utility2.assert(error, error);
                        onParallel();
                    }, onParallel);
                });
            });
            // test testCase-error handling-behavior
            [
                'testCase_collectionCreate_misc',
                'testCase_crudAggregateMany_default',
                'testCase_crudCreateXxx_default',
                'testCase_crudGetXxx_default',
                'testCase_crudDeleteById_default',
                'testCase_crudUpdateXxx_default'
            ].forEach(function (testCase) {
                if (local[testCase]) {
                    onParallel.counter += 1;
                    local[testCase]({
                        error: local.utility2.errorDefault
                    }, function (error) {
                        local.utility2.testTryCatch(function () {
                            // validate error occurred
                            local.utility2.assert(error, error);
                            onParallel();
                        }, onParallel);
                    });
                }
            });
            onParallel();
        };

        local.testCase_validateByParamDefList_default = function (options, onError) {
            /*
             * this function will test validateByParamDefList's default handling-behavior
             */
            var error;
            // jslint-hack
            local.utility2.nop(options);
            [{
                data: { body: { fieldRequired: true } },
                key: 'crudCreateOne',
                method: 'post'
            }, {
                data: { query: '{}' },
                key: 'crudCountByQueryOne',
                method: 'get'
            }].forEach(function (options) {
                options.paramDefList = local.swmg.swaggerJson
                    .paths['/_TestModel/' + options.key][options.method]
                    .parameters;
                local.swmg.validateByParamDefList(options);
            });
            // test validateByParamDefList's error handling-behavior
            [{
                data: { body: { fieldRequired: null } },
                key: 'crudCreateOne',
                method: 'post'
            }, {
                data: { query: 'syntax error' },
                key: 'crudCountByQueryOne',
                method: 'get'
            }].forEach(function (options) {
                try {
                    error = null;
                    options.paramDefList = local.swmg.swaggerJson
                        .paths['/_TestModel/' + options.key][options.method]
                        .parameters;
                    local.swmg.validateByParamDefList(options);
                } catch (errorCaught) {
                    error = errorCaught;
                }
                // validate error occurred
                local.utility2.assert(error, error);
            });
            // test validateByPropertyDef's circular-reference handling-behavior
            local.swmg.validateByPropertyDef({
                data: { fieldObject: {} },
                propertyDef: { fieldObject: { type: 'object' } }
            });
            onError();
        };

        local.testCase_validateBySchema_default = function (options, onError) {
            /*
             * this function will test validateBySchema's default handling-behavior
             */
            var optionsCopy;
            options = {
                schema: local.swmg.swaggerJson.definitions.TestCrudModel,
                data: { fieldRequired: true }
            };
            [
                { key: 'fieldArray', value: [null] },
                { key: 'fieldArraySubdoc', value: [{ fieldRequired: true }] },
                { key: 'fieldBoolean', value: true },
                { key: 'fieldInteger', value: 0 },
                { key: 'fieldIntegerInt32', value: 0 },
                { key: 'fieldIntegerInt64', value: 0 },
                { key: 'fieldNumberFloat', value: 0.5 },
                { key: 'fieldNumberDouble', value: 0.5 },
                { key: 'fieldObject', value: {} },
                { key: 'fieldObjectSubdoc', value: {} },
                { key: 'fieldString', value: '' },
                { key: 'fieldStringByte', value: local.modeJs === 'browser'
                    ? local.global.btoa(local.utility2.stringAsciiCharset)
                    : new Buffer(local.utility2.stringAsciiCharset).toString('base64') },
                { key: 'fieldStringDate', value: '1971-01-01' },
                { key: 'fieldStringDatetime', value: '1971-01-01T00:00:00Z' },
                { key: 'fieldStringEmail', value: 'q@q.com' },
                { key: 'fieldStringJson', value: 'null' },
                { key: 'fieldUndefined', value: null },
                { key: 'fieldUndefined', value: undefined },
                { key: 'fieldUndefined', value: true }
            ].forEach(function (element) {
                optionsCopy = local.utility2.jsonCopy(options.data);
                optionsCopy[element.key] = element.value;
                // test circular-reference handling-behavior
                optionsCopy.fieldArraySubdoc = optionsCopy.fieldArraySubdoc || [optionsCopy];
                optionsCopy.fieldObject = optionsCopy.fieldObject || optionsCopy;
                optionsCopy.fieldObjectSubdoc = optionsCopy.fieldObjectSubdoc || optionsCopy;
                local.swmg.validateBySchema({ data: optionsCopy, schema: options.schema });
            });
            onError();
        };

        local.testCase_validateBySchema_error = function (options, onError) {
            /*
             * this function will test validateBySchema's error handling-behavior
             */
            var error, optionsCopy;
            options = {
                schema: local.swmg.swaggerJson.definitions.TestCrudModel,
                data: { fieldRequired: true }
            };
            [
                { data: null },
                { key: 'fieldArray', value: true },
                { key: 'fieldArraySubdoc', value: [{ fieldRequired: null }] },
                { key: 'fieldBoolean', value: 0 },
                { key: 'fieldInteger', value: true },
                { key: 'fieldInteger', value: Infinity },
                { key: 'fieldInteger', value: NaN },
                { key: 'fieldIntegerInt32', value: 0.5 },
                { key: 'fieldIntegerInt64', value: 0.5 },
                { key: 'fieldNumber', value: true },
                { key: 'fieldNumber', value: Infinity },
                { key: 'fieldNumber', value: NaN },
                { key: 'fieldNumberFloat', value: true },
                { key: 'fieldNumberDouble', value: true },
                { key: 'fieldObject', value: true },
                { key: 'fieldObjectSubdoc', value: 'non-object' },
                { key: 'fieldRequired', value: null },
                { key: 'fieldRequired', value: undefined },
                { key: 'fieldString', value: true },
                { key: 'fieldStringByte', value: local.utility2.stringAsciiCharset },
                { key: 'fieldStringDate', value: 'null' },
                { key: 'fieldStringDatetime', value: 'null' },
                { key: 'fieldStringEmail', value: 'null' },
                { key: 'fieldStringJson', value: 'syntax error' }
            ].forEach(function (element) {
                try {
                    error = null;
                    optionsCopy = local.utility2.jsonCopy(options.data);
                    optionsCopy[element.key] = element.value;
                    local.swmg.validateBySchema({
                        data: element.data === null
                            ? null
                            : optionsCopy,
                        schema: options.schema
                    });
                } catch (errorCaught) {
                    error = errorCaught;
                }
                // validate error occurred
                local.utility2.assert(error, error);
            });
            onError();
        };

        local.testCase_validateBySwagger_default = function (options, onError) {
            /*
             * this function will test validateBySwagger's default handling-behavior
             */
            var error;
            // jslint-hack
            local.utility2.nop(options);
            local.utility2.testMock([
                // suppress console.error
                [console, { error: local.utility2.nop }]
            ], function (onError) {
                [null, {}].forEach(function (element) {
                    try {
                        local.swmg.validateBySwagger(element);
                    } catch (errorCaught) {
                        error = errorCaught;
                    }
                    // validate error occurred
                    local.utility2.assert(error, error);
                });
                onError();
            }, onError);
        };
    }());
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        // init tests
        local.testCase_collectionCreate_misc = function (options, onError) {
            /*
             * this function will test the collectionCreate's misc handling-behavior
             */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error) {
                modeNext = error
                    ? Infinity
                    : modeNext + 1;
                switch (modeNext) {
                case 1:
                    // test null schema handling-behavior
                    local.swmg.collectionCreate({
                        _collectionName: 'SwmgTestMisc',
                        // test _collectionReadonly handling-behavior
                        _collectionReadonly: true
                    }, onNext);
                    break;
                case 2:
                    local.swmg.collectionCreate({
                        // test _collectionCreate handling-behavior
                        _collectionCreate: {},
                        // test _collectionDrop handling-behavior
                        _collectionDrop: true,
                        _collectionName: 'SwmgTestMisc'
                    }, onNext);
                    break;
                case 3:
                    local.swmg.collectionCreate({
                        // test capped-collection handling-behavior
                        _collectionCreate: { capped: true, size: 1 },
                        // test _collectionCreateIndexList handling-behavior
                        _collectionCreateIndexList: [{
                            key: { fieldIndexed: 1 },
                            name: 'fieldIndexed_1'
                        }],
                        _collectionName: 'SwmgTestMisc'
                    }, onNext);
                    break;
                case 4:
                    local.swmg.collectionCreate({
                        // test error handling-behavior
                        _collectionCreateIndexList: [],
                        _collectionName: 'SwmgTestMisc'
                    }, function (error) {
                        local.utility2.testTryCatch(function () {
                            // validate error occurred
                            local.utility2.assert(error, error);
                            onNext();
                        }, onNext);
                    });
                    break;
                default:
                    onError(error);
                }
            };
            onNext(options && options.error);
        };

        local.testCase_middlewareBodyParse_misc = function (options, onError) {
            /*
             * this function will test middlewareBodyParse's misc handling-behavior
             */
            var onParallel;
            // jslint-hack
            local.utility2.nop(options);
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            // test swmgBodyParsed exists handling-behavior
            onParallel.counter += 1;
            local.swmg.middlewareBodyParse({
                swmgBodyParsed: {},
                swmgMethodPath: { parameters: [] }
            }, {}, onParallel);
            onParallel();
        };

        local.testCase_testPage_default = function (options, onError) {
            /*
             * this function will test the test-page's default handling-behavior
             */
            // jslint-hack
            local.utility2.nop(options);
            local.utility2.phantomTest({
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '?modeTest=phantom&timeExit={{timeExit}}'
            }, onError);
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // init swaggerUi
        local.utility2.onReady.counter += 1;
        window.swaggerUi = new window.SwaggerUi({
            dom_id: "swagger-ui-container",
            onComplete: function () {
                local.swmg.swaggerJson = local.swmg.api.swaggerJson;
                local.utility2.onReady();
            },
            supportedSubmitMethods: ['delete', 'get', 'patch', 'post', 'put'],
            url: '/api/v0/swagger.json'
        });
        // init api
        window.swaggerUi.load();
        local.swmg.api = window.swaggerUi.api;
        // run test
        local.utility2.testRun(local);
        break;



    // run node js-env code
    case 'node':
        // test null apiUpdate handling-behavior
        local.swmg.apiUpdate({});
        // init crud-api
        local.swmg.apiUpdate({
            definitions: {
                TestCrudModel: {
                    _collectionDrop: true,
                    _collectionName: 'SwmgTestCrud',
                    _crudApi: '_TestModel',
                    properties: {
                        fieldArray: { items: {}, type: 'array' },
                        fieldArraySubdoc: {
                            default: [{ fieldRequired: true }],
                            items: { $ref: '#/definitions/TestCrudModel' },
                            type: 'array'
                        },
                        fieldBoolean: { type: 'boolean' },
                        fieldInteger: { type: 'integer' },
                        fieldIntegerInt32: { format: 'int32', type: 'integer' },
                        fieldIntegerInt64: { format: 'int64', type: 'integer' },
                        fieldNumber: { type: 'number' },
                        fieldNumberDouble: { format: 'double', type: 'number' },
                        fieldNumberFloat: { format: 'float', type: 'number' },
                        fieldObject: { type: 'object' },
                        fieldObjectSubdoc: { $ref: '#/definitions/TestNullModel' },
                        fieldRequired: { default: true },
                        fieldString: { type: 'string' },
                        fieldStringByte: { format: 'byte', type: 'string' },
                        fieldStringDate: { format: 'date', type: 'string' },
                        fieldStringDatetime: { format: 'date-time', type: 'string' },
                        fieldStringEmail:
                            { default: 'a@a.com', format: 'email', type: 'string' },
                        fieldStringJson: { default: 'null', format: 'json', type: 'string' },
                        fieldUndefined: {}
                    },
                    required: ['fieldRequired'],
                    'x-inheritList': [{ $ref: '#/definitions/JsonapiResource' }]
                },
                TestNullModel: {}
            },
            paths: {
                // test custom api handling-behavior
                '/_TestModel/echo': { post: {
                    _collectionName: 'SwmgTestCrud',
                    // test extra-param handling-behavior
                    _paramExtraDict: { paramExtra2: '{{paramExtra}}' },
                    operationId: 'echo',
                    parameters: [{
                        // test array-csv-param handling-behavior
                        collectionFormat: 'csv',
                        description: 'csv-array param',
                        in: 'query',
                        items: { type: 'string' },
                        name: 'paramArrayCsv',
                        type: 'array'
                    }, {
                        // test array-pipes-param handling-behavior
                        collectionFormat: 'pipes',
                        description: 'pipes-array param',
                        in: 'query',
                        items: { type: 'string' },
                        name: 'paramArrayPipes',
                        type: 'array'
                    }, {
                        // test array-ssv-param handling-behavior
                        collectionFormat: 'ssv',
                        description: 'ssv-array param',
                        in: 'query',
                        items: { type: 'string' },
                        name: 'paramArraySsv',
                        type: 'array'
                    }, {
                        // test array-tsv-param handling-behavior
                        collectionFormat: 'tsv',
                        description: 'tsv-array param',
                        in: 'query',
                        items: { type: 'string' },
                        name: 'paramArrayTsv',
                        type: 'array'
                    }, {
                        description: 'body',
                        // test body-param handling-behavior
                        in: 'body',
                        name: 'paramBody',
                        schema: { $ref: '#/definitions/Undefined' }
                    }, {
                        description: 'extra param',
                        in: 'query',
                        // test extra-param handling-behavior
                        name: 'paramExtra',
                        type: 'string'
                    }, {
                        description: 'header param',
                        // test header-param handling-behavior
                        in: 'header',
                        name: 'paramHeader',
                        type: 'string'
                    }, {
                        description: 'optional param',
                        in: 'query',
                        // test optional-param handling-behavior
                        name: 'paramOptional',
                        type: 'string'
                    }],
                    summary: 'echo request params back to client',
                    tags: ['_TestModel']
                } },
                // test custom-api handling-behavior
                '/_TestModel/customGetByIdOne/{id}': { get: {
                    _collectionName: 'SwmgTestCrud',
                    operationId: 'customGetByIdOne',
                    parameters: [{
                        description: 'SwmgTestCrud id',
                        in: 'path',
                        name: 'id',
                        required: true,
                        type: 'string'
                    }],
                    tags: ['_TestModel']
                } },
                // test midddleware-error handling-behavior
                '/_TestModel/errorMiddleware': { get: {
                    operationId: 'errorMiddleware',
                    tags: ['_TestModel']
                } },
                // test undefined api handling-behavior
                '/_TestModel/errorUndefinedApi': { get: {
                    operationId: 'errorUndefinedApi',
                    tags: ['_TestModel']
                } },
                // test undefined crud-api handling-behavior
                '/_TestModel/errorUndefinedCrud': { get: {
                    _collectionName: 'SwmgTestCrud',
                    _crudApi: true,
                    operationId: 'errorUndefinedCrud',
                    tags: ['_TestModel']
                } }
            },
            tags: [
                { description: 'internal test model', name: '_TestModel' }
            ]
        });
        // run validation test
        local.testCase_validateByParamDefList_default(null, local.utility2.onErrorDefault);
        local.testCase_validateBySchema_default(null, local.utility2.onErrorDefault);
        local.testCase_validateBySwagger_default(null, local.utility2.onErrorDefault);
        // jslint dir
        [
            __dirname
        ].forEach(function (dir) {
            local.fs.readdirSync(dir).forEach(function (file) {
                file = dir + '/' + file;
                // if the file is modified, then restart the process
                local.utility2.onFileModifiedRestart(file);
                switch (local.path.extname(file)) {
                case '.js':
                case '.json':
                    // jslint file
                    local.utility2.jslint_lite
                        .jslintAndPrint(local.fs.readFileSync(file, 'utf8'), file);
                    break;
                }
            });
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
        if (local.modeJs === 'node') {
            require('fs').writeFileSync(
                './example.js',
                require('fs').readFileSync('./README.md', 'utf8')
                    // support syntax-highlighting
                    .replace((/[\S\s]+?\n.*?example.js\s*?```\w*?\n/), function (match0) {
                        // preserve lineno
                        return match0.replace((/.+/g), '');
                    })
                    .replace((/\n```[\S\s]+/), '')
            );
            // init example.js
            local = require('./example.js');
        }
        // init onReady
        local.utility2.onReadyInit();
        // init swmg
        local.swmg = local.modeJs === 'browser'
            ? window.swmg
            : require('./index.js');
        // export local
        local.global.local = local;
    }());
    return local;
}())));
