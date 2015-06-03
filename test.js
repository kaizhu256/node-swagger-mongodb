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
        // init tests
        local.testCase_ajax_404 = function (onError) {
            /*
                this function will test ajax's "404 not found" handling behavior
            */
            // test '/test/undefined'
            local.utility2.ajax({ url: '/test/undefined?modeErrorIgnore=1' }, function (error) {
                local.utility2.testTryCatch(function () {
                    // validate error occurred
                    local.utility2.assert(error, error);
                    // validate 404 http statusCode
                    local.utility2.assert(error.statusCode === 404, error.statusCode);
                    onError();
                }, onError);
            });
        };

        local._testCase_crudCreateXxx_default = function (options, onError) {
            /*
                this function will test _crudCreateXxx's default handling behavior
            */
            var api, modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        // init api
                        api = local.swmg.api.TestCrudModel;
                        // init options
                        options.body = {
                            fieldExtra: 'hello',
                            fieldRequired: true,
                            id: options.id
                        };
                        // validate object does not exist
                        api.crudExistsByIdOne({ id: options.id }, options, onNext);
                        break;
                    case 2:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object does not exist
                        local.utility2.assert(data.obj.data[0] === false, data.obj.data[0]);
                        // test createXxx's default handling behavior
                        data = local.utility2.jsonCopy(options);
                        api[options.operationId](data, options, onNext);
                        break;
                    case 3:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object
                        data = data.obj.data[0];
                        switch (options.operationId) {
                        case 'crudReplaceOne':
                        case 'crudUpdateOne':
                            local.utility2.assert(data === null, data);
                            break;
                        default:
                            local.utility2.assert(data.fieldExtra === 'hello', data.fieldExtra);
                        }
                        // delete object by id
                        local._testCase_crudDeleteById_default({ id: options.id }, onNext);
                        break;
                    case 4:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        onNext();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext();
        };

        local._testCase_crudGetXxx_default = function (options, onError) {
            /*
                this function will test crudGetXxx's default handling behavior
            */
            var api, modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        // init api
                        api = local.swmg.api.TestCrudModel;
                        // init options
                        options.limit = 1;
                        options.query = JSON.stringify({ id: options.id });
                        // validate object does not exist
                        api[options.operationId](
                            local.utility2.jsonCopy(options),
                            options,
                            onNext
                        );
                        break;
                    case 2:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object does not exist
                        local.utility2.assert(
                            !data.obj.data[0],
                            [data.obj.data[0], options.operationId]
                        );
                        // create object
                        api.crudCreateOne(
                            {
                                body: { fieldRequired: true, id: options.id },
                                id: options.id
                            },
                            onNext
                        );
                        break;
                    case 3:
                        // validate object exists
                        api[options.operationId](
                            local.utility2.jsonCopy(options),
                            options,
                            onNext
                        );
                        break;
                    case 4:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object exists
                        local.utility2.assert(
                            data.obj.data[0],
                            [data.obj.data[0], options.operationId]
                        );
                        // delete object by id
                        local._testCase_crudDeleteById_default({ id: options.id }, onNext);
                        break;
                    case 5:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        onNext();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext();
        };

        local._testCase_crudDeleteById_default = function (options, onError) {
            /*
                this function will test crudDeleteById's default handling behavior
            */
            var api, modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        // init api
                        api = local.swmg.api.TestCrudModel;
                        // init options
                        options.modeErrorData = true;
                        // delete object by id
                        api.crudDeleteByIdOne({ id: options.id }, options, onNext);
                        break;
                    case 2:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object does not exist
                        api.crudExistsByIdOne({ id: options.id }, options, onNext);
                        break;
                    case 3:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate object does not exist
                        local.utility2.assert(data.obj.data[0] === false, data.obj.data[0]);
                        onNext();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudXxx_default = function (onError) {
            /*
                this function will test crudXxx's default handling behavior
            */
            var api, modeNext, onNext, onParallel, options, optionsCopy;
            modeNext = 0;
            onNext = function (error) {
                local.utility2.testTryCatch(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    // test create handling behavior
                    case 1:
                        // phantom-hack - skip broken code
                        if (local.modePhantom) {
                            onNext();
                            return;
                        }
                        onParallel = local.utility2.onParallel(onNext);
                        onParallel.counter += 1;
                        // init api
                        api = local.swmg.api.TestCrudModel;
                        // init options
                        options = {};
                        options.modeErrorData = true;
                        // test crudCreate* handling behavior
                        [
                            'crudCreateOne',
                            'crudReplaceOne',
                            'crudReplaceOrCreateOne',
                            'crudUpdateOne',
                            'crudUpdateOrCreateOne'
                        ].forEach(function (operationId) {
                            optionsCopy = local.utility2.jsonCopy(options);
                            optionsCopy.$urlExtra = '?modeErrorIgnore=1';
                            optionsCopy.id = 'test_' + local.utility2.uuidTime();
                            optionsCopy.operationId = operationId;
                            onParallel.counter += 1;
                            local._testCase_crudCreateXxx_default(optionsCopy, onParallel);
                        });
                        // test crudGet* handling behavior
                        [
                            'crudCountByQuery',
                            'crudGetByIdOne',
                            'crudGetByQueryMany',
                            'crudExistsByIdOne'
                        ].forEach(function (operationId) {
                            optionsCopy = local.utility2.jsonCopy(options);
                            optionsCopy.id = 'test_' + local.utility2.uuidTime();
                            optionsCopy.operationId = operationId;
                            onParallel.counter += 1;
                            local._testCase_crudGetXxx_default(optionsCopy, onParallel);
                        });
                        // test echo handling behavior
                        optionsCopy = local.utility2.jsonCopy(options);
                        optionsCopy.id = 'test_' + local.utility2.uuidTime();
                        optionsCopy.paramHeader = 'hello';
                        onParallel.counter += 1;
                        api.echo(optionsCopy, optionsCopy, function (error, data) {
                            local.utility2.testTryCatch(function () {
                                // validate no error occurred
                                local.utility2.assert(!error, error);
                                // validate data
                                data = data.obj;
                                local.utility2.assert(local.utility2
                                    .jsonStringifyOrdered(data) === JSON.stringify({
                                        paramHeader: 'hello'
                                    }), data);
                                onParallel();
                            }, onParallel);
                        });
                        onParallel();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudXxx_error = function (onError) {
            /*
                this function will test crudXxx's error handling behavior
            */
            var api, modeNext, onNext, onParallel, options, optionsCopy;
            modeNext = 0;
            onNext = function (error) {
                local.utility2.testTryCatch(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    // test create handling behavior
                    case 1:
                        onParallel = local.utility2.onParallel(onNext);
                        onParallel.counter += 1;
                        // init api
                        api = local.swmg.api.TestCrudModel;
                        // init options
                        options = {
                            paramHeader: '1'
                        };
                        options.modeErrorData = true;
                        // test undefined api handling behavior
                        [
                            'errorUndefinedApi',
                            'errorUndefinedCrud'
                        ].forEach(function (operationId) {
                            optionsCopy = local.utility2.jsonCopy(options);
                            optionsCopy.$urlExtra = '?modeErrorIgnore=1';
                            optionsCopy.id = 'test_' + local.utility2.uuidTime();
                            optionsCopy.operationId = operationId;
                            onParallel.counter += 1;
                            api[
                                optionsCopy.operationId
                            ](optionsCopy, optionsCopy, function (error) {
                                local.utility2.testTryCatch(function () {
                                    // validate error occurred
                                    local.utility2.assert(error, error);
                                    onParallel();
                                }, onParallel);
                            });
                        });
                        // test low-level ajax handling behavior
                        [{
                            url: '/api/v0/TestCrudModel/errorUndefined?modeErrorIgnore=1'
                        }].forEach(function (options) {
                            local.utility2.ajax(options, function (error) {
                                local.utility2.testTryCatch(function () {
                                    // validate error occurred
                                    local.utility2.assert(error, error);
                                    onParallel();
                                }, onParallel);
                            });
                        });
                        onParallel();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_validateXxx_default = function (onError) {
            /*
                this function will test validateXxx's default handling behavior
            */
            var data, error, options;
            // test validateParameters's default handling behavior
            [{
                data: { body: { fieldRequired: true } },
                key: 'crudCreateOne',
                method: 'post'
            }, {
                data: { query: '{}' },
                key: 'crudCountByQuery',
                method: 'get'
            }].forEach(function (options) {
                options.parameters = local.swmg.swaggerJson
                    .paths['/TestCrudModel/' + options.key][options.method]
                    .parameters;
                local.swmg.validateParameters(options);
            });
            // test validateParameters's error handling behavior
            [{
                data: { body: { fieldRequired: null } },
                key: 'crudCreateOne',
                method: 'post'
            }, {
                data: { query: 'syntax error' },
                key: 'crudCountByQuery',
                method: 'get'
            }].forEach(function (options) {
                try {
                    error = null;
                    options.parameters = local.swmg.swaggerJson
                        .paths['/TestCrudModel/' + options.key][options.method]
                        .parameters;
                    local.swmg.validateParameters(options);
                } catch (errorCaught) {
                    error = errorCaught;
                }
                // validate error occurred
                local.utility2.assert(error, error);
            });
            // test validateProperty's circular-reference handling behavior
            local.swmg.validateProperty({
                data: { fieldObject: {} },
                property: { fieldObject: { type: 'object' } }
            });
            // test validateSchema's default handling behavior
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
                { key: 'fieldObjectSubdoc', value: { fieldRequired: true } },
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
                data = local.utility2.jsonCopy(options.data);
                data[element.key] = element.value;
                // test circular-reference handling behavior
                data.fieldArraySubdoc = data.fieldArraySubdoc || [data];
                data.fieldObject = data.fieldObject || data;
                data.fieldObjectSubdoc = data.fieldObjectSubdoc || data;
                local.swmg.validateSchema({
                    data: data,
                    schema: options.schema
                });
            });
            // test validateSchema's error handling behavior
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
                { key: 'fieldObjectSubdoc', value: { fieldRequired: null } },
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
                    data = local.utility2.jsonCopy(options.data);
                    data[element.key] = element.value;
                    local.swmg.validateSchema({
                        data: element.data === null
                            ? null
                            : data,
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
    }());
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        // init tests
        local.testCase_testPage_default = function (onError) {
            /*
                this function will test the test-page's default handling behavior
            */
            local.utility2.phantomTest({
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '?modeTest=phantom&' +
                    '_testSecret={{_testSecret}}&' +
                    'timeoutDefault=' + local.utility2.timeoutDefault
            }, onError);
        };
        break;
    }
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // init modePhantom
        local.modePhantom = (/\bPhantomJS\b/).test(navigator.userAgent);
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
        // init extra middleware
        local.middleware.middlewareList.push(function (request, response, nextMiddleware) {
            switch (request.urlParsed.pathnameNormalized) {
            case '/api/v0/TestCrudModel/echo':
                response.end(JSON.stringify(request.swmgParameters));
                break;
            default:
                nextMiddleware();
            }
        });
        // init crud-api
        local.swmg.apiUpdate({
            definitions: {
                TestCrudModel: {
                    _collectionName: 'SwmgTestCollection',
                    _crudApi: true,
                    properties: {
                        fieldArray: { items: {}, type: 'array' },
                        fieldArraySubdoc: {
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
                        fieldObjectSubdoc: { $ref: '#/definitions/TestCrudModel' },
                        fieldRequired: {},
                        fieldString: { type: 'string' },
                        fieldStringByte: { format: 'byte', type: 'string' },
                        fieldStringDate: { format: 'date', type: 'string' },
                        fieldStringDatetime: { format: 'date-time', type: 'string' },
                        fieldStringEmail: { format: 'email', type: 'string' },
                        fieldStringJson: { format: 'json', type: 'string' },
                        fieldUndefined: {}
                    },
                    required: ['fieldRequired'],
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                },
                TestNullModel: {},
                TestNullSchemaModel: {
                    _collectionName: 'SwmgTestCollection'
                }
            },
            paths: {
                '/TestCrudModel/echo': { get: {
                    _collectionName: 'SwmgTestCollection',
                    operationId: 'echo',
                    parameters: [{
                        description: 'header param',
                        // test header-param handling behavior
                        in: 'header',
                        name: 'paramHeader',
                        required: true,
                        type: 'string'
                    }],
                    tags: ['TestCrudModel']
                } },
                // test undefined api handling behavior
                '/TestCrudModel/errorUndefinedApi': { get: {
                    operationId: 'errorUndefinedApi',
                    tags: ['TestCrudModel']
                } },
                // test undefined crud-api handling behavior
                '/TestCrudModel/errorUndefinedCrud': { get: {
                    _collectionName: 'SwmgTestCollection',
                    _crudApi: true,
                    operationId: 'errorUndefinedCrud',
                    tags: ['TestCrudModel']
                } }
            },
            tags: [
                { description: 'Everything about your pets', name: 'PetModel' },
                { description: 'Access to Petstore orders', name: 'StoreModel' },
                { description: 'internal test model', name: 'TestCrudModel' },
                { description: 'Operations about user', name: 'UserModel' }
            ]
        });
        // run validation test
        local.testCase_validateXxx_default(local.utility2.onErrorDefault);
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
