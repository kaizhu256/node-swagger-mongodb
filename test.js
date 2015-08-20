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
            // test '/_test/undefined'
            local.utility2.ajax({ url: '/_test/undefined' }, function (error) {
                local.utility2.testTryCatch(function () {
                    // validate error occurred
                    local.utility2.assert(error, error);
                    // validate 404 http statusCode
                    local.utility2.assert(error.statusCode === 404, error.statusCode);
                    onError();
                }, onError);
            });
        };

        local.testCase_crudCreateMany_default = function (options, onError) {
            /*
             * this function will test crudCreateMany's default handling-behavior
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
                    // test create handling-behavior
                    [
                        'crudCreateMany',
                        'crudReplaceMany',
                        'createUsersWithArrayInput',
                        'createUsersWithListInput'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudCreateMany_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId
                        }, onParallel);
                    });
                    // test upsert handling-behavior
                    [
                        'crudReplaceMany'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudCreateMany_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId,
                            upsert: true
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
                        options.body = [
                            local.optionsId({ id: options.id + '0', propRequired: true }),
                            local.optionsId({ id: options.id + '1', propRequired: true }),
                            // test default id handling-behavior
                            local.optionsId({ propRequired: true })
                        ];
                        options.modeErrorData = true;
                        // init api
                        options.api = options.api || '_test';
                        api = local.swmg.api[options.api];
                        // if api does not have the operation, then skip testCase
                        if (!api[options.operationId]) {
                            onError2();
                            return;
                        }
                        // test crudCreateMany's default handling-behavior
                        data = local.utility2.jsonCopy(options);
                        api[options.operationId](data, options, onNext);
                        break;
                    case 2:
                        // validate object
                        data = data.obj.data;
                        local.utility2.assert(data.length === options.body.length, data.length);
                        switch (options.operationId) {
                        case 'crudReplaceMany':
                            if (!options.upsert) {
                                local.utility2.assert(data.every(function (element) {
                                    return !element;
                                }), data);
                                modeNext = Infinity;
                                onNext();
                                return;
                            }
                            break;
                        }
                        local.utility2.assert(data.every(function (element) {
                            return element;
                        }), data);
                        options.body = data;
                        // init query
                        options.query = JSON.stringify({ id: { $in: options.body.map(
                            function (element) {
                                return element.id;
                            }
                        ) } });
                        // validate object
                        api.crudGetByQueryMany({
                            limit: 8,
                            query: options.query
                        }, options, onNext);
                        break;
                    case 3:
                        // validate object
                        data = data.obj.data;
                        local.utility2.assert(data.length === options.body.length, data.length);
                        local.utility2.assert(data.every(function (element) {
                            return element;
                        }), data);
                        onNext();
                        break;
                    default:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // remove object by query
                        local.testCase_crudDeleteByQueryMany_default(options, onError2);
                    }
                }, onError2);
            };
            onNext(options && options.error);
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
                    // test create handling-behavior
                    [
                        'crudCreateOne',
                        'crudReplaceOne',
                        'crudUpdateOne',
                        'updatePet',
                        'updatePetWithForm',
                        'updateUser'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudCreateXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId
                        }, onParallel);
                    });
                    // test upsert handling-behavior
                    [
                        'crudReplaceOne',
                        'crudUpdateOne'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudCreateXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId,
                            upsert: true
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
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // init options
                        options.body = local.optionsId({
                            id: options.id,
                            propExtra: 'hello',
                            propRequired: true
                        });
                        options.modeErrorData = true;
                        // init api
                        options.api = options.api || '_test';
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
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object does not exist
                        local.utility2.assert(data.obj.data[0] === null, data.obj.data[0]);
                        // test createXxx's default handling-behavior
                        data = local.utility2.jsonCopy(options);
                        api[options.operationId](local.optionsId(data), options, onNext);
                        break;
                    case 3:
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                        case 'crudUpdateOne':
                            if (!options.upsert) {
                                // validate error occurred
                                local.utility2.assert(error, error);
                                modeNext = Infinity;
                                onNext();
                                return;
                            }
                            break;
                        default:
                            // validate no error occurred
                            local.utility2.assert(!error, error);
                        }
                        // validate object
                        data = data.obj.data[0];
                        options._timeCreated = data._timeCreated;
                        options._timeModified = data._timeModified;
                        local.utility2.assert(data.name === options.id, data.name);
                        local.utility2.assert(data.status === options.id, data.status);
                        switch (options.operationId) {
                        case 'updatePetWithForm':
                            local.utility2
                                .assert(data.propExtra === undefined, data.propExtra);
                            local.utility2
                                .assert(data.propRequired === undefined, data.propRequired);
                            break;
                        default:
                            local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                            local.utility2
                                .assert(data.propRequired === true, data.propRequired);
                        }
                        // get object
                        api.crudGetByIdOne(local.optionsId({
                            id: options.id
                        }), options, onNext);
                        break;
                    case 4:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
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
                        local.utility2.assert(data.name === options.id, data.name);
                        local.utility2.assert(data.status === options.id, data.status);
                        switch (options.operationId) {
                        case 'updatePetWithForm':
                            local.utility2
                                .assert(data.propExtra === undefined, data.propExtra);
                            local.utility2
                                .assert(data.propRequired === undefined, data.propRequired);
                            break;
                        default:
                            local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                            local.utility2
                                .assert(data.propRequired === true, data.propRequired);
                        }
                        switch (options.operationId) {
                        case 'crudCreateOne':
                            // test duplicate createXxx's error handling-behavior
                            data = local.utility2.jsonCopy(options);
                            api[options.operationId](local.optionsId(data), options, onNext);
                            break;
                        default:
                            onNext();
                        }
                        break;
                    case 5:
                        switch (options.operationId) {
                        case 'crudCreateOne':
                            // validate error occurred
                            local.utility2.assert(error, error);
                            modeNext = Infinity;
                            onNext();
                            return;
                        default:
                            // validate no error occurred
                            local.utility2.assert(!error, error);
                        }
                        onNext();
                        break;
                    default:
                        if (options.modeNoDelete) {
                            onError2(error, options);
                            return;
                        }
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // remove object by id
                        local.testCase_crudDeleteByIdOne_default(options, onError2);
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
            local.swmg.api._test.echo({
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
                // test header-param handling-behavior
                paramHeader: 'hello'
            }, { modeErrorData: true }, function (error, data) {
                local.utility2.testTryCatch(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate object
                    data = local.utility2.jsonStringifyOrdered(data.obj);
                    local.utility2.assert(data === JSON.stringify({
                        paramArrayCsv: ['aa', 'bb'],
                        paramArrayPipes: ['aa', 'bb'],
                        paramArraySsv: ['aa', 'bb'],
                        paramArrayTsv: ['aa', 'bb'],
                        paramBody: 'hello!',
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
                        'crudAggregateMany',
                        'crudCountByQueryOne',
                        'crudGetByIdOne',
                        'crudGetByQueryMany',
                        'crudGetDistinctValueByPropertyMany',
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
                        options.api = options.api || '_test';
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
                        case 'crudGetDistinctValueByPropertyMany':
                        case 'getInventory':
                            local.utility2.assert(data.length >= 1, data.length);
                            break;
                        default:
                            local.utility2.assert(data.length === 1, data.length);
                        }
                        local.utility2.assert(data[0], data[0]);
                        onNext();
                        break;
                    default:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // remove object by id
                        local.testCase_crudDeleteByIdOne_default(options, onError2);
                    }
                }, onError2);
            };
            onNext(options && options.error);
        };

        local.testCase_crudDeleteByQueryMany_default = function (options, onError) {
            /*
             * this function will test crudDeleteByQueryMany's default handling-behavior
             */
            var api, modeNext, onNext, onParallel;
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
                        options.api = options.api || '_test';
                        api = local.swmg.api[options.api];
                        // remove object by query
                        options.query = options.query || '{"id":{"$in":["id0","id1"]}}';
                        if (!api.crudDeleteByQueryMany) {
                            onParallel = local.utility2.onParallel(onNext);
                            onParallel.counter += 1;
                            JSON.parse(options.query).id.$in.forEach(function (id) {
                                onParallel.counter += 1;
                                api.crudDeleteByIdOne(local
                                    .optionsId({ id: id }), options, onParallel);
                            });
                            onParallel();
                            return;
                        }
                        api.crudDeleteByQueryMany({ query: options.query }, options, onNext);
                        break;
                    case 2:
                        // validate object does not exist
                        api.crudGetByQueryMany({
                            limit: 8,
                            query: options.query
                        }, options, onNext);
                        break;
                    case 3:
                        // validate object does not exist
                        data = data.obj.data;
                        local.utility2.assert(data.length === 0, data.length);
                        onNext();
                        break;
                    default:
                        onError(error);
                    }
                }, onError);
            };
            onNext(options && options.error);
        };

        local.testCase_crudDeleteByIdOne_default = function (options, onError) {
            /*
             * this function will test crudDeleteByIdOne's default handling-behavior
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
                        options.api = options.api || '_test';
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
                    }
                }, onError);
            };
            onNext(options && options.error);
        };

        local.testCase_crudReplaceXxx_default = function (options, onError) {
            /*
             * this function will test crudReplaceXxx's default handling-behavior
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
                    // test update handling-behavior
                    [
                        'crudReplaceOne',
                        'crudUpdateOne',
                        'updatePetWithForm'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudReplaceXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId
                        }, onParallel);
                    });
                    // test upsert handling-behavior
                    [
                        'crudReplaceOne',
                        'crudUpdateOne'
                    ].forEach(function (operationId) {
                        onParallel.counter += 1;
                        local.testCase_crudReplaceXxx_default({
                            api: api,
                            id: 'test_' + local.utility2.uuidTime(),
                            operationId: operationId,
                            upsert: true
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
                            id: options.id,
                            propRequired: false
                        });
                        options.modeErrorData = true;
                        // init api
                        options.api = options.api || '_test';
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
                            data._timeModified > options._timeModified,
                            [data._timeModified, options._timeModified]
                        );
                        local.utility2.assert(data.name === options.id, data.name);
                        local.utility2.assert(data.status === options.id, data.status);
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                            local.utility2.assert(
                                data._timeCreated > options._timeCreated,
                                [data._timeCreated, options._timeCreated]
                            );
                            local.utility2
                                .assert(data.propExtra === undefined, data.propExtra);
                            local.utility2
                                .assert(data.propRequired === false, data.propRequired);
                            break;
                        case 'updatePetWithForm':
                            local.utility2.assert(
                                data._timeCreated === options._timeCreated,
                                [data._timeCreated, options._timeCreated]
                            );
                            local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                            local.utility2
                                .assert(data.propRequired === true, data.propRequired);
                            break;
                        default:
                            local.utility2.assert(
                                data._timeCreated === options._timeCreated,
                                [data._timeCreated, options._timeCreated]
                            );
                            local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                            local.utility2
                                .assert(data.propRequired === false, data.propRequired);
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
                            data._timeModified > options._timeModified,
                            [data._timeModified, options._timeModified]
                        );
                        local.utility2.assert(data.name === options.id, data.name);
                        local.utility2.assert(data.status === options.id, data.status);
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                            local.utility2.assert(
                                data._timeCreated > options._timeCreated,
                                [data._timeCreated, options._timeCreated]
                            );
                            local.utility2
                                .assert(data.propExtra === undefined, data.propExtra);
                            local.utility2
                                .assert(data.propRequired === false, data.propRequired);
                            break;
                        case 'updatePetWithForm':
                            local.utility2.assert(
                                data._timeCreated === options._timeCreated,
                                [data._timeCreated, options._timeCreated]
                            );
                            local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                            local.utility2
                                .assert(data.propRequired === true, data.propRequired);
                            break;
                        default:
                            local.utility2.assert(
                                data._timeCreated === options._timeCreated,
                                [data._timeCreated, options._timeCreated]
                            );
                            local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                            local.utility2
                                .assert(data.propRequired === false, data.propRequired);
                        }
                        onNext();
                        break;
                    default:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // remove object by id
                        local.testCase_crudDeleteByIdOne_default(options, onError2);
                    }
                }, onError2);
            };
            onNext(options && options.error);
        };

        local.testCase_crudUploadFile_default = function (options, onError) {
            /*
             * this function will test crudUploadFile's default handling-behavior
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
                        options.api = 'pet';
                        api = local.swmg.api[options.api];
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
                        // test file-upload handling-behavior
                        local.utility2.ajax({
/* jslint-ignore-begin */
                            data: '------FormBoundaryXxx\r\nContent-Disposition: form-data; name="additionalMetadata"\r\n\r\nhello\r\n------FormBoundaryXxx\r\nContent-Disposition: form-data; name="file"; filename="hello.png"\r\nContent-Type: image/png\r\n\r\ndata\r\n------FormBoundaryXxx--\r\n',
/* jslint-ignore-end */
                            headers: {
                                'Content-Type':
                                    'multipart/form-data; boundary=----FormBoundaryXxx'
                            },
                            method: 'POST',
                            url: '/api/v0/pet/' + options.id + '/uploadImage'
                        }, onNext);
                        break;
                    case 3:
                        // validate object
                        data = JSON.parse(data.responseText).data[0];
                        local.utility2.assert(
                            data._timeCreated === options._timeCreated,
                            [data._timeCreated, options._timeCreated]
                        );
                        local.utility2.assert(
                            data._timeModified > options._timeModified,
                            [data._timeModified, options._timeModified]
                        );
                        local.utility2.assert(
                            data.additionalMetadata === 'hello',
                            data.additionalMetadata
                        );
                        local.utility2.assert(data.file === 'ZGF0YQ==', data.file);
                        local.utility2.assert(data.filename === 'hello.png', data.filename);
                        local.utility2.assert(data.petId === options.id, data.petId);
                        local.utility2.assert(data.propExtra === 'hello', data.propExtra);
                        local.utility2
                            .assert(data.propRequired === true, data.propRequired);
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
                        onNext();
                        break;
                    default:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // remove object by id
                        local.testCase_crudDeleteByIdOne_default(options, onError);
                    }
                }, onError);
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
            api = local.swmg.api._test;
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
                url: '/api/v0/_test/errorUndefined'
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
                'testCase_crudCreateMany_default',
                'testCase_crudCreateXxx_default',
                'testCase_crudGetXxx_default',
                'testCase_crudDeleteByIdOne_default',
                'testCase_crudDeleteByQueryMany_default',
                'testCase_crudReplaceXxx_default',
                'testCase_crudUploadFile_default'
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
                data: { body: { propRequired: true } },
                key: 'crudCreateOne',
                method: 'post'
            }, {
                data: { query: '{}' },
                key: 'crudCountByQueryOne',
                method: 'get'
            }].forEach(function (options) {
                options.paramDefList = local.swmg.swaggerJson
                    .paths['/_test/' + options.key][options.method]
                    .parameters;
                local.swmg.validateByParamDefList(options);
            });
            // test validateByParamDefList's error handling-behavior
            [{
                data: { body: { propRequired: null } },
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
                        .paths['/_test/' + options.key][options.method]
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
                data: { propObject: {} },
                propertyDef: { propObject: { type: 'object' } }
            });
            onError();
        };

        local.testCase_validateBySchema_default = function (options, onError) {
            /*
             * this function will test validateBySchema's default handling-behavior
             */
            var optionsCopy;
            options = {
                data: { propRequired: true },
                schema: local.swmg.swaggerJson.definitions.TestCrudModel
            };
            [
                { key: 'propArray', value: [null] },
                { key: 'propArraySubdoc', value: [{ propRequired: true }] },
                { key: 'propBoolean', value: true },
                { key: 'propInteger', value: 0 },
                { key: 'propIntegerInt32', value: 0 },
                { key: 'propIntegerInt64', value: 0 },
                { key: 'propNumberFloat', value: 0.5 },
                { key: 'propNumberDouble', value: 0.5 },
                { key: 'propObject', value: {} },
                { key: 'propObjectSubdoc', value: {} },
                { key: 'propString', value: '' },
                { key: 'propStringByte', value: local.modeJs === 'browser'
                    ? local.global.btoa(local.utility2.stringAsciiCharset)
                    : new Buffer(local.utility2.stringAsciiCharset).toString('base64') },
                { key: 'propStringDate', value: '1971-01-01' },
                { key: 'propStringDatetime', value: '1971-01-01T00:00:00Z' },
                { key: 'propStringEmail', value: 'q@q.com' },
                { key: 'propStringJson', value: 'null' },
                { key: 'propUndefined', value: null },
                { key: 'propUndefined', value: undefined },
                { key: 'propUndefined', value: true }
            ].forEach(function (element) {
                optionsCopy = local.utility2.jsonCopy(options.data);
                optionsCopy[element.key] = element.value;
                // test circular-reference handling-behavior
                optionsCopy.propArraySubdoc = optionsCopy.propArraySubdoc || [optionsCopy];
                optionsCopy.propObject = optionsCopy.propObject || optionsCopy;
                optionsCopy.propObjectSubdoc = optionsCopy.propObjectSubdoc || optionsCopy;
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
                data: { propRequired: true },
                schema: local.swmg.swaggerJson.definitions.TestCrudModel
            };
            [
                { data: null },
                { key: 'propArray', value: true },
                { key: 'propArraySubdoc', value: [{ propRequired: null }] },
                { key: 'propBoolean', value: 0 },
                { key: 'propInteger', value: true },
                { key: 'propInteger', value: Infinity },
                { key: 'propInteger', value: NaN },
                { key: 'propIntegerInt32', value: 0.5 },
                { key: 'propIntegerInt64', value: 0.5 },
                { key: 'propNumber', value: true },
                { key: 'propNumber', value: Infinity },
                { key: 'propNumber', value: NaN },
                { key: 'propNumberFloat', value: true },
                { key: 'propNumberDouble', value: true },
                { key: 'propObject', value: true },
                { key: 'propObjectSubdoc', value: 'non-object' },
                { key: 'propRequired', value: null },
                { key: 'propRequired', value: undefined },
                { key: 'propString', value: true },
                { key: 'propStringByte', value: local.utility2.stringAsciiCharset },
                { key: 'propStringDate', value: 'null' },
                { key: 'propStringDatetime', value: 'null' },
                { key: 'propStringEmail', value: 'null' },
                { key: 'propStringJson', value: 'syntax error' }
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
                            key: { propIndexed: 1 },
                            name: 'propIndexed_1'
                        }],
                        _collectionName: 'SwmgTestMisc'
                    }, onNext);
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
        // init test api
        local.swmg.apiUpdate({
            definitions: {
                // init TestCrudModel schema
                TestCrudModel: {
                    // drop collection on init
                    _collectionDrop: true,
                    _collectionName: 'SwmgTestCrud',
                    // init default crud-api
                    _crudApi: '_test',
                    _crudApiList: [
                        'crudAggregateMany',
                        'crudCountByQueryOne',
                        'crudCreateMany',
                        'crudCreateOne',
                        'crudDeleteByQueryMany',
                        'crudDeleteByIdOne',
                        'crudExistsByIdOne',
                        'crudGetByIdOne',
                        'crudGetByQueryMany',
                        'crudGetDistinctValueByPropertyMany',
                        'crudReplaceMany',
                        'crudReplaceOne',
                        'crudUpdateOne'
                    ],
                    properties: {
                        propArray: { items: {}, type: 'array' },
                        propArraySubdoc: {
                            default: [{ propRequired: true }],
                            items: { $ref: '#/definitions/TestCrudModel' },
                            type: 'array'
                        },
                        propBoolean: { type: 'boolean' },
                        propInteger: { type: 'integer' },
                        propIntegerInt32: { format: 'int32', type: 'integer' },
                        propIntegerInt64: { format: 'int64', type: 'integer' },
                        propNumber: { type: 'number' },
                        propNumberDouble: { format: 'double', type: 'number' },
                        propNumberFloat: { format: 'float', type: 'number' },
                        propObject: { type: 'object' },
                        propObjectSubdoc: { $ref: '#/definitions/TestNullModel' },
                        propRequired: { default: true },
                        propString: { type: 'string' },
                        propStringByte: { format: 'byte', type: 'string' },
                        propStringDate: { format: 'date', type: 'string' },
                        propStringDatetime: { format: 'date-time', type: 'string' },
                        propStringEmail:
                            { default: 'a@a.com', format: 'email', type: 'string' },
                        propStringJson:
                            { default: 'null', format: 'json', type: 'string' },
                        propUndefined: {}
                    },
                    required: ['propRequired'],
                    'x-inheritList': [{ $ref: '#/definitions/JsonapiResource' }]
                },
                // init TestNullModel schema
                TestNullModel: {}
            },
            paths: {
                // test custom api handling-behavior
                '/_test/echo': { post: {
                    _collectionName: 'SwmgTestCrud',
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
                    tags: ['_test']
                } },
                // test midddleware-error handling-behavior
                '/_test/errorMiddleware': { get: {
                    operationId: 'errorMiddleware',
                    tags: ['_test']
                } },
                // test undefined api handling-behavior
                '/_test/errorUndefinedApi': { get: {
                    operationId: 'errorUndefinedApi',
                    tags: ['_test']
                } },
                // test undefined crud-api handling-behavior
                '/_test/errorUndefinedCrud': { get: {
                    _collectionName: 'SwmgTestCrud',
                    _crudApi: true,
                    operationId: 'errorUndefinedCrud',
                    tags: ['_test']
                } }
            },
            _tagDict: { _test: { description: 'internal test-api' } }
        });
        // init test-middleware
        local.middleware.middlewareList.push(function (request, response, nextMiddleware) {
            switch (request.swmgPathname) {
            case 'POST /_test/echo':
                response.end(JSON.stringify(request.swmgParamDict));
                break;
            case 'GET /_test/errorMiddleware':
                nextMiddleware(new Error('dummy error'));
                break;
            default:
                nextMiddleware();
            }
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
        switch (local.modeJs) {
        // re-init local from window.local
        case 'browser':
            local = window.local;
            break;
        // re-init local from example.js
        case 'node':
            [
                process.cwd(),
                // test dir !== __dirname handling-behavior
                ''
            ].forEach(function (dir) {
                if (dir !== __dirname) {
                    local = require(__dirname + '/example.js');
                    return;
                }
                require('fs').writeFileSync(
                    __dirname + '/example.js',
                    require('fs').readFileSync(__dirname + '/README.md', 'utf8')
                        // support syntax-highlighting
                        .replace((/[\S\s]+?\n.*?example.js\s*?```\w*?\n/), function (match0) {
                            // preserve lineno
                            return match0.replace((/.+/g), '');
                        })
                        .replace((/\n```[\S\s]+/), '')
                        // disable mock package.json env
                        .replace(/(process.env.npm_package_\w+ = )/g, '// $1')
                        // alias require('$npm_package_name') to require('index.js');
                        .replace(
                            "require('" + process.env.npm_package_name + "')",
                            "require(__dirname + '/index.js')"
                        )
                );
                local = require(__dirname + '/example.js');
            });
            break;
        }
    }());
    return local;
}())));
