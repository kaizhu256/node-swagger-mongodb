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
                        api = local.swmgdb.api.CrudModel;
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
            var modeNext, onNext, onTaskEnd, options, optionsCopy;
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
                        onTaskEnd = local.utility2.onTaskEnd(onNext);
                        onTaskEnd.counter += 1;
                        // init options
                        options = {};
                        options.$urlExtra = '?&modeErrorIgnore=1';
                        options.modeErrorData = true;
                        [
                            'crudCreateOne',
                            'crudReplaceOne',
                            'crudReplaceOrCreateOne',
                            'crudUpdateOne',
                            'crudUpdateOrCreateOne'
                        ].forEach(function (operationId) {
                            optionsCopy = local.utility2.jsonCopy(options);
                            optionsCopy.operationId = operationId;
                            onTaskEnd.counter += 1;
                            local._testCase_crudCreateXxx_default(optionsCopy, onTaskEnd);
                        });
                        onTaskEnd();
                        break;
                    default:
                        onError(error);
                        break;
                    }
                }, onError);
            };
            onNext();
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
                        api = local.swmgdb.api.CrudModel;
                        // init options
                        options.body = {
                            fieldRequired: true,
                            operationId: options.operationId
                        };
                        options.body.id = options.id = 'test_' + local.utility2.uuidTime();
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
                            local.utility2.assert(
                                data.operationId === options.operationId,
                                data.operationId
                            );
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

        local.testCase_validateAgainstXxx_default = function (onError) {
            /*
                this function will test validateAgainstXxx's default handling behavior
            */
            var data, error, options;
            // test validateAgainstParameters's default handling behavior
            [{
                data: { body: { fieldRequired: true } },
                key: 'crudCreateOne',
                method: 'post'
            }, {
                data: { query: '{}' },
                key: 'crudCountByQuery',
                method: 'get'
            }].forEach(function (options) {
                options.parameters = local.swmgdb.swaggerJson
                    .paths['/CrudModel/' + options.key][options.method]
                    .parameters;
                local.swmgdb.validateAgainstParameters(options);
            });
            // test validateAgainstParameters's error handling behavior
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
                    options.parameters = local.swmgdb.swaggerJson
                        .paths['/CrudModel/' + options.key][options.method]
                        .parameters;
                    local.swmgdb.validateAgainstParameters(options);
                } catch (errorCaught) {
                    error = errorCaught;
                }
                // validate error occurred
                local.utility2.assert(error, error);
            });
            // test validateAgainstProperty's circular-reference handling behavior
            local.swmgdb.validateAgainstProperty({
                data: { fieldObject: {} },
                property: { fieldObject: { type: 'object' } }
            });
            // test validateAgainstSchema's default handling behavior
            options = {
                schema: local.swmgdb.swaggerJson.definitions.CrudModel,
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
                local.swmgdb.validateAgainstSchema({
                    data: data,
                    schema: options.schema
                });
            });
            // test validateAgainstSchema's error handling behavior
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
                    local.swmgdb.validateAgainstSchema({
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



    // run browser js-env code
    case 'browser':
        // init modePhantom
        local.modePhantom = (/\bPhantomJS\b/).test(navigator.userAgent);
        // init tests
        break;



    // run node js-env code
    case 'node':
        // init tests
        local.testCase_testPage_default = function (onError) {
            /*
                this function will test the test-page's default handling behavior
            */
            var onTaskEnd;
            onTaskEnd = local.utility2.onTaskEnd(onError);
            onTaskEnd.counter += 1;
            // test test-page handling behavior
            onTaskEnd.counter += 1;
            local.utility2.phantomTest({
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '?modeTest=phantom&' +
                    '_testSecret={{_testSecret}}&' +
                    'timeoutDefault=' + local.utility2.timeoutDefault
            }, onTaskEnd);
            onTaskEnd();
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
                local.swmgdb.swaggerJson = local.swmgdb.api.swaggerJson;
                local.utility2.onReady();
            },
            supportedSubmitMethods: ['delete', 'get', 'patch', 'post', 'put'],
            url: '/api/v0/swagger.json'
        });
        // init api
        window.swaggerUi.load();
        local.swmgdb.api = window.swaggerUi.api;
        // run test
        local.utility2.testRun(local);
        break;



    // run node js-env code
    case 'node':
        // init mongodb-client
        local.utility2.onReady.counter += 1;
        local.utility2.taskRunOrSubscribe({
            key: 'swagger-mongodb.mongodbConnect',
            onTask: function (onError) {
                local.mongodb.MongoClient.connect(
                    local.utility2.envDict.npm_config_mongodb_url ||
                        'mongodb://localhost:27017/test',
                    function (error, db) {
                            // validate no error occurred
                            local.utility2.assert(!error, error);
                            local.swmgdb.db = db;
                            onError();
                            local.utility2.onReady();
                            // run validation test
                            local.testCase_validateAgainstXxx_default(
                                local.utility2.onErrorDefault
                            );
                        }
                );
            }
        });
        // init swmgdb
        local.swmgdb.apiUpdate({
            definitions: {
                CrudModel: {
                    _collectionName: 'SwmgdbCrudCollection',
                    _crudApi: true,
                    properties: {
                        fieldArray: { items: {}, type: 'array' },
                        fieldArraySubdoc: {
                            items: { $ref: '#/definitions/CrudModel' },
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
                        fieldObjectSubdoc: { $ref: '#/definitions/CrudModel' },
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
                PetModel: {
                    _collectionName: 'SwmgdbPetCollection',
                    _crudApi: true,
                    properties: {},
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                },
                StoreModel: {
                    _collectionName: 'SwmgdbStoreCollection',
                    _crudApi: true,
                    properties: {},
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                },
                UserModel: {
                    _collectionName: 'SwmgdbUserCollection',
                    _crudApi: true,
                    properties: {
                        email: { format: 'email', type: 'string' },
                        passwordHash: { type: 'string' },
                        username: { type: 'string' }
                    },
                    required: ['passwordHash', 'username'],
                    'x-inheritList': [{ $ref: '#/definitions/JsonApiResource' }]
                }
            },
            tags: [
                { description: 'default mongodb crud api', name: 'CrudModel' },
                { description: 'Everything about your pets', name: 'PetModel' },
                { description: 'Access to Petstore orders', name: 'StoreModel' },
                { description: 'Operations about user', name: 'UserModel' }
            ]
        });
        // init assets
        local.utility2.cacheDict.assets['/'] =
            local.utility2.cacheDict.assets['/test/test.html'] =
            local.utility2.stringFormat(local.fs
                .readFileSync(__dirname + '/README.md', 'utf8')
                // extract html
                .replace((/[\S\s]+?(<!DOCTYPE html>[\S\s]+?<\/html>)[\S\s]+/), '$1')
                // parse '\' line-continuation
                .replace((/\\\n/g), '')
                // remove "\\n' +" and "'"
                .replace((/\\n' \+(\s*?)'/g), '$1'), { envDict: local.utility2.envDict }, '');
        local.utility2.cacheDict.assets['/assets/swagger-mongodb.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.swmgdb['/assets/swagger-mongodb.js'],
                __dirname + '/index.js',
                'swagger-mongodb'
            );
        local.utility2.cacheDict.assets['/test/test.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.fs.readFileSync(__filename, 'utf8'),
                __filename,
                'swagger-mongodb'
            );
        // init middleware
        local.middleware = local.utility2.middlewareGroupCreate([
            local.utility2.middlewareInit,
            local.utility2.middlewareAssetsCached,
            local.swmgdb.middleware
        ]);
        // init middleware error-handler
        local.onMiddlewareError = local.swmgdb.onMiddlewareError;
        // run server-test
        local.utility2.testRunServer(local);
        // init dir
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
        // export local
        local.global.local = local;
        // init utility2
        local.utility2 = local.modeJs === 'browser'
            ? window.utility2
            : require('utility2');
        // init onReady
        local.utility2.onReadyInit();
        // init swmgdb
        local.swmgdb = local.modeJs === 'browser'
            ? window.swmgdb
            : require('./index.js');
        // import swmgdb.local
        Object.keys(local.swmgdb.local).forEach(function (key) {
            local[key] = local[key] || local.swmgdb.local[key];
        });
    }());
    return local;
}())));
