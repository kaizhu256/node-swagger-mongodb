/*jslint
    browser: true,
    maxerr: 4,
    maxlen: 80,
    node: true,
    nomen: true,
    stupid: true
*/
(function () {
    'use strict';
    var local;
    // init local
    local = {};
    local.cms2 = { local: local };



    // run shared js-env code
    (function () {
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
        // init utility2
        local.utility2 = local.modeJs === 'browser'
            ? window.utility2
            : require('utility2');
        // init env
        local.cms2.apiPrefix =
            local.utility2.envDict.npm_config_mode_api_prefix || '/api/v0.1';
    }());
    switch (local.modeJs) {



    // run browser js-env code
    case 'browser':
        // export cms2
        window.cms2 = local.cms2;
        break;



    // run node js-env code
    case 'node':
        // export cms2
        module.exports = local.cms2;
        // require modules
        local.fs = require('fs');
        local.path = require('path');
        local.swagger_ui_lite = require('swagger-ui-lite');
        local.utility2 = require('utility2');
        // init assets
        local.cms2['/assets/cms2.js'] = local.fs
            .readFileSync(__filename, 'utf8');
        local.cms2['/assets/swagger-ui.html'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.html',
                'utf8'
            )
            .replace(
                'http://petstore.swagger.io/v2/swagger.json',
                local.cms2.apiPrefix + '/swagger.json'
            );
        local.cms2['/assets/swagger-ui.rollup.css'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.rollup.css',
                'utf8'
            );
        local.cms2['/assets/swagger-ui.rollup.js'] = local.fs
            .readFileSync(
                local.swagger_ui_lite.__dirname + '/swagger-ui.rollup.js',
                'utf8'
            );
        local.cms2[local.cms2.apiPrefix + '/swagger.json'] = local.fs
            .readFileSync(
                './swagger.json',
                'utf8'
            );
        // init serverMiddlewareList
        local.cms2.serverMiddlewareList = [
            function (request, response, onNext) {
                /*
                    this function will serve builtin assets
                */
                switch (request.urlPathNormalized) {
                // serve assets
                case '/assets/utility2.css':
                case '/assets/utility2.js':
                case '/test/test.js':
                    response.end(local.utility2[request.urlPathNormalized]);
                    break;
                case '/assets/cms2.js':
                case '/assets/swagger-ui.html':
                case '/assets/swagger-ui.rollup.css':
                case '/assets/swagger-ui.rollup.js':
                    response.end(local.cms2[request.urlPathNormalized]);
                    break;
                // default to next middleware
                default:
                    onNext();
                }
            },
            function (request, response, onNext) {
                /*
                    this function will serve api
                */
                var path;
                path = request.urlPathNormalized;
                if (path.indexOf(
                        local.cms2.apiPrefix
                    ) === 0) {
                    path = path.replace(local.cms2.apiPrefix, '');
                } else {
                    onNext();
                }
                switch (path) {
                // serve swagger.json
                case '/swagger.json':
                    response.end(local.cms2[
                        local.cms2.apiPrefix + '/swagger.json'
                    ]);
                    break;
                // default to next middleware
                default:
                    onNext();
                }
            }
        ];
        break;
    }
}());
