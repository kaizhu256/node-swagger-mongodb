/*jslint
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    stupid: true,
*/
(function () {
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
        // init cms2
        local.cms2 = local.modeJs === 'browser'
            ? window.cms2
            : require('./index.js');
        // init utility2
        local.utility2 = local.cms2.local.utility2;
        // init jslint_lite
        local.jslint_lite = local.utility2.local.jslint_lite;
        // init istanbul_lite
        local.istanbul_lite = local.utility2.local.istanbul_lite;
        // init tests
        local.testCase_ajax_404 = function (onError) {
            /*
                this function will test ajax's
                404 http statusCode handling behavior
            */
            // test '/test/undefined'
            local.utility2.ajax({
                url: '/test/undefined'
            }, function (error) {
                local.utility2.testTryCatch(function () {
                    // validate error occurred
                    local.utility2.assert(error instanceof Error, error);
                    // validate 404 http statusCode
                    local.utility2.assert(error.statusCode === 404, error.statusCode);
                    onError();
                }, onError);
            });
        };
    }());
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export local
        window.local = local;
        // run test
        local.utility2.testRun(local);
        break;



    // run node js-env code
    case 'node':
        // export local
        global.local = local;
        // require modules
        local.fs = require('fs');
        local.path = require('path');
        local.url = require('url');
        local.utility2 = require('utility2');
        // init tests
        local.testCase_testPage_default = function (onError) {
            /*
                this function will test the test-page's
                default handling behavior
            */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            // test test-page handling behavior
            onParallel.counter += 1;
            local.utility2.phantomTest({
                url: 'http://localhost:' +
                    local.utility2.envDict.npm_config_server_port +
                    '?modeTest=phantom&' +
                    '_testSecret={{_testSecret}}&' +
                    'timeoutDefault=' + local.utility2.timeoutDefault
            }, onParallel);
            onParallel();
        };
        // init assets
        local['/'] =
            local.utility2.stringFormat(local.fs
                .readFileSync(__dirname + '/README.md', 'utf8')
                .replace((/[\S\s]+?(<!DOCTYPE html>[\S\s]+?<\/html>)[\S\s]+/), '$1')
                // parse '\' line-continuation
                .replace((/\\\n/g), '')
                .replace((/\\n' \+(\s*?)'/g), '$1'), { envDict: local.utility2.envDict });
        local['/assets/cms2.js'] =
            local.istanbul_lite.instrumentInPackage(
                local.cms2['/assets/cms2.js'],
                __dirname + '/index.js',
                'cms2'
            );
        local['/test/test.js'] =
            local.istanbul_lite.instrumentInPackage(
                local.fs.readFileSync(__filename, 'utf8'),
                __filename,
                'cms2'
            );
        // init server-middlewares
        local.serverMiddlewareList = [
            function (request, response, onNext) {
                /*
                    this function will run the main test-middleware
                */
                switch (request.urlParsed.pathnameNormalized) {
                // serve assets
                case '/':
                case '/test/test.js':
                    response.end(local[request.urlParsed.pathnameNormalized]);
                    break;
                // default to next middleware
                default:
                    onNext();
                }
            }
        ].concat([local.cms2.serverMiddleware]);
        // run server-test
        local.utility2.testRunServer(local);
        // init dir
        local.fs.readdirSync(__dirname).forEach(function (file) {
            file = __dirname + '/' + file;
            switch (local.path.extname(file)) {
            case '.js':
            case '.json':
                // jslint the file
                local.jslint_lite.jslintAndPrint(local.fs.readFileSync(file, 'utf8'), file);
                break;
            }
            // if the file is modified, then restart the process
            local.utility2.onFileModifiedRestart(file);
        });
        // init repl debugger
        local.utility2.replStart({});
        break;
    }
}());
