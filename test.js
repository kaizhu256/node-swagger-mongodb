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
                        api = local.swmg.api.TestModel;
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
                        api = local.swmg.api.TestModel;
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
                    .paths['/TestModel/' + options.key][options.method]
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
                        .paths['/TestModel/' + options.key][options.method]
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
                schema: local.swmg.swaggerJson.definitions.TestModel,
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
