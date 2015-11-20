swagger-mongodb
===============
lightweight swagger-ui crud-middleware backed by mongodb

[![NPM](https://img.shields.io/npm/v/swagger-mongodb.svg?style=flat-square)](https://www.npmjs.org/package/swagger-mongodb)



# live test-server
[![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.herokuDeploy.slimerjs..png)](https://hrku01-swagger-mongodb-beta.herokuapp.com)



# build-status [![travis-ci.org build-status](https://api.travis-ci.org/kaizhu256/node-swagger-mongodb.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)
[![build commit status](https://kaizhu256.github.io/node-swagger-mongodb/build/build.badge.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)

| git-branch : | [master](https://github.com/kaizhu256/node-swagger-mongodb/tree/master) | [beta](https://github.com/kaizhu256/node-swagger-mongodb/tree/beta) | [alpha](https://github.com/kaizhu256/node-swagger-mongodb/tree/alpha)|
|--:|:--|:--|:--|
| test-server : | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-master.herokuapp.com) | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-beta.herokuapp.com) | [![heroku.com test-server](https://kaizhu256.github.io/node-swagger-mongodb/heroku-logo.75x25.png)](https://hrku01-swagger-mongodb-alpha.herokuapp.com)|
| test-report : | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/test-report.html) | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/test-report.html) | [![test-report](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/test-report.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/test-report.html)|
| coverage : | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..master..travis-ci.org/coverage.html/index.html) | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..beta..travis-ci.org/coverage.html/index.html) | [![istanbul-lite coverage](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/coverage.badge.svg)](https://kaizhu256.github.io/node-swagger-mongodb/build..alpha..travis-ci.org/coverage.html/index.html)|
| build-artifacts : | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..master..travis-ci.org) | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..beta..travis-ci.org) | [![build-artifacts](https://kaizhu256.github.io/node-swagger-mongodb/glyphicons_144_folder_open.png)](https://github.com/kaizhu256/node-swagger-mongodb/tree/gh-pages/build..alpha..travis-ci.org)|

#### master branch
- stable branch
- HEAD should be tagged, npm-published package

#### beta branch
- semi-stable branch
- HEAD should be latest, npm-published package

#### alpha branch
- unstable branch
- HEAD is arbitrary
- commit history may be rewritten



# documentation
#### this package requires
- darwin or linux os
- mongodb 2.6 or higher

#### [api-doc](https://kaizhu256.github.io/node-swagger-mongodb/build/doc.api.html)
[![api-doc](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.docApiCreate.slimerjs._2Fhome_2Ftravis_2Fbuild_2Fkaizhu256_2Fnode-swagger-mongodb_2Ftmp_2Fbuild_2Fdoc.api.html.png)](https://kaizhu256.github.io/node-swagger-mongodb/build/doc.api.html)



# quickstart web example
#### to run this example, follow the instruction in the script below
- example.js

```javascript
/*
example.js

this node script will serve a lightweight swagger-ui crud-api backed by mongodb

instruction
    1. save this script as example.js
    2. run the shell command:
          $ npm install swagger-mongodb && npm_config_server_port=1337 node example.js
    3. open a browser to http://localhost:1337
    4. interact with the swagger-ui crud-api
*/

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
    switch (local.modeJs) {



    // run node js-env code
    case 'node':
        // export local
        module.exports = local;
        // init assets
        local.utility2.cacheDict.assets['/'] = '<!DOCTYPE html>\n' +
/* jslint-ignore-begin */
'<html>\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <title>\n' +
'    {{envDict.npm_package_name}} [{{envDict.npm_package_version}}]\n' +
'    </title>\n' +
'    <link rel="stylesheet" href="/assets/utility2.css">\n' +
'    <style>\n' +
'    * {\n' +
'        box-sizing: border-box;\n' +
'    }\n' +
'    body {\n' +
'        background-color: #fff;\n' +
'        font-family: Helvetical Neue, Helvetica, Arial, sans-serif;\n' +
'    }\n' +
'    body > div {\n' +
'        margin: 20px 0 20px 0;\n' +
'    }\n' +
'    .testReportDiv {\n' +
'        display: none;\n' +
'    }\n' +
'    </style>\n' +
'    {{envDict.npm_config_html_head_extra}}\n' +
'</head>\n' +
'<body>\n' +
'    <div class="ajaxProgressDiv" style="display: none;">\n' +
'    <div class="ajaxProgressBarDiv ajaxProgressBarDivLoading">loading</div>\n' +
'    </div>\n' +
'    <h1>{{envDict.npm_package_name}} [{{envDict.npm_package_version}}]</h1>\n' +
'    <h3>{{envDict.npm_package_description}}</h3>\n' +
'    <div class="testReportDiv"></div>\n' +
'    <div id="swagger-ui-container" style="display: none;"></div>\n' +
'    <iframe height="512" src="/assets/swagger-ui.html" width="100%"></iframe>\n' +
'    <script src="/assets/utility2.js"></script>\n' +
'    <script src="/assets/swagger-ui.rollup.js"></script>\n' +
'    <script src="/assets/swagger-mongodb.js"></script>\n' +
'    <script src="/assets/example.js"></script>\n' +
'    <script src="/test/test.js"></script>\n' +
'    <script>\n' +
'    window.utility2 = window.utility2 || {};\n' +
'    window.utility2.envDict = {\n' +
'        npm_package_description: "{{envDict.npm_package_description}}",\n' +
'        npm_package_name: "{{envDict.npm_package_name}}",\n' +
'        npm_package_version: "{{envDict.npm_package_version}}"\n' +
'    };\n' +
'    document.querySelector("iframe").onload = function () {\n' +
'        var self;\n' +
'        self = this;\n' +
'        self.height = innerHeight - self.offsetTop - 20;\n' +
'        self.contentWindow.location.hash = location.hash;\n' +
'        self.contentWindow.onclick = function () {\n' +
'            setTimeout(function () {\n' +
'                location.hash = self.contentWindow.location.hash;\n' +
'            });\n' +
'        };\n' +
'    };\n' +
'    </script>\n' +
'    {{envDict.npm_config_html_body_extra}}\n' +
'</body>\n' +
/* jslint-ignore-end */
            '</html>\n';
        local.utility2.cacheDict.assets['/'] = local.utility2.stringFormat(
            local.utility2.cacheDict.assets['/'],
            { envDict: local.utility2.envDict },
            ''
        );
        local.utility2.cacheDict.assets['/assets/example.js'] =
            local.utility2.istanbul_lite.instrumentSync(
                local.fs.readFileSync(__dirname + '/example.js', 'utf8'),
                __dirname + '/example.js'
            );
        local.utility2.cacheDict.assets['/test/test.js'] =
            local.utility2.istanbul_lite.instrumentInPackage(
                local.fs.readFileSync(local.swmg.__dirname + '/test.js', 'utf8'),
                local.swmg.__dirname + '/test.js',
                'swagger-mongodb'
            );
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
                            local.swmg.db = db;
                            onError();
                            local.utility2.onReady();
                        }
                );
            }
        });
        // init middleware
        local.middleware = local.utility2.middlewareGroupCreate([
            // init pre-middleware
            local.utility2.middlewareInit,
            // init cached-assets middleware
            local.utility2.middlewareAssetsCached,
            // init http-body-get middleware
            local.utility2.middlewareBodyGet,
            // init http-body-parse-upload middleware
            function (request, response, nextMiddleware) {
                var boundary, bodyText;
                // jslint-hack
                local.utility2.nop(response);
                local.utility2.testTryCatch(function () {
                    if ((request.headers['content-type'] || '')
                            .indexOf('multipart/form-data') !== 0) {
                        nextMiddleware();
                        return;
                    }
                    boundary =
                        '--' + (/boundary=(.*)/).exec(request.headers['content-type'])[1];
                    request.swmgBodyParsed = {};
                    bodyText = String(request.bodyRaw);
                    bodyText.split(boundary).slice(1, -1).forEach(function (part) {
                        request.swmgBodyParsed[
                            (/\bname="([^"]*)/).exec(part)[1]
                        ] = part.split('\r\n\r\n').slice(1).join('\r\n\r\n').slice(0, -2);
                    });
                    // set file
                    bodyText.replace('\r\n\r\n', function (match0, ii) {
                        // jslint-hack
                        local.utility2.nop(match0);
                        request.swmgBodyParsed.file = request.bodyRaw
                            .slice(ii + 4, -(boundary.length + 6))
                            .toString('base64');
                    });
                    request.swmgBodyParsed.file = request.bodyRaw
                        .slice(bodyText.lastIndexOf('\r\n\r\n') + 4, -(boundary.length + 6))
                        .toString('base64');
                    // set filename
                    request.swmgBodyParsed.filename = (/\bfilename="([^"]+)/).exec(bodyText);
                    request.swmgBodyParsed.filename =
                        request.swmgBodyParsed.filename &&
                        request.swmgBodyParsed.filename[1];
                    nextMiddleware();
                }, nextMiddleware);
            },
            // init http-body-parse middleware
            local.swmg.middlewareBodyParse,
            // init swagger pre-middleware
            function (request, response, nextMiddleware) {
                // jslint-hack
                local.utility2.nop(request);
                // enable cors
                // http://en.wikipedia.org/wiki/Cross-origin_resource_sharing
                response.setHeader(
                    'Access-Control-Allow-Methods',
                    'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'
                );
                response.setHeader('Access-Control-Allow-Origin', '*');
                // init content-type
                response.setHeader('Content-Type', 'application/json; charset=UTF-8');
                nextMiddleware();
            },
            // init swagger middleware
            local.swmg.middlewareSwagger
        ]);
        // init error-middleware
        local.middlewareError = local.swmg.middlewareError;
        // init petstore-api
        (function () {
            var methodPath, options, schema;
            options = local.utility2.jsonCopy(require(local.swmg.local
                .swagger_ui_lite.__dirname + '/swagger.json'));
            options = {
                definitions: options.definitions,
                paths: options.paths,
                tags: options.tags
            };
            // remove unused properties
            delete options.definitions.ApiResponse;
            // init schema
            Object.keys(options.definitions).forEach(function (schemaName) {
                schema = options.definitions[schemaName];
                // init id
                schema.properties.id = { type: 'string' };
                schema['x-inheritList'] = [{ $ref: '#/definitions/JsonapiResource' }];
            });
            local.utility2.objectSetOverride(options, {
                definitions: {
                    // init Pet schema
                    Pet: {
                        // drop collection on init
                        _collectionDrop: true,
                        // upsert fixtures
                        _collectionFixtureList: [{
                            id: 'pet0',
                            name: 'birdie',
                            photoUrls: [],
                            status: 'available',
                            tags: [{ name: 'bird'}]
                        }, {
                            id: 'pet1',
                            name: 'kittie',
                            status: 'pending',
                            photoUrls: [],
                            tags: [{ name: 'cat'}]
                        }, {
                            id: 'pet2',
                            name: 'doggie',
                            photoUrls: [],
                            status: 'sold',
                            tags: [{ name: 'dog'}]
                        }],
                        _collectionName: 'SwmgPet'
                    },
                    // init Order schema
                    Order: {
                        // create index
                        _collectionCreateIndexList: [{
                            key: { status: 1 },
                            name: 'status_1'
                        }],
                        // drop collection on init
                        _collectionDrop: true,
                        // upsert fixtures
                        _collectionFixtureList: [{
                            id: 'order0',
                            status: 'available'
                        }, {
                            id: 'order1',
                            status: 'pending'
                        }, {
                            id: 'order2',
                            status: 'sold'
                        }],
                        _collectionName: 'SwmgOrder',
                        properties: {
                            petId: { type: 'string' }
                        }
                    },
                    // init User schema
                    User: {
                        // create index
                        _collectionCreateIndexList: [{
                            key: { username: 1 },
                            name: 'username_1',
                            unique: true
                        }],
                        // drop collection on init
                        _collectionDrop: true,
                        // upsert fixtures
                        _collectionFixtureList: [{
                            email: 'john@doe.com',
                            firstName: 'john',
                            id: 'user0',
                            lastName: 'doe',
                            password: 'hello',
                            phone: '1234-5678',
                            username: 'john.doe'
                        }, {
                            email: 'jane@doe.com',
                            firstName: 'jane',
                            id: 'user1',
                            lastName: 'doe',
                            password: 'bye',
                            phone: '8765-4321',
                            username: 'jane.doe'
                        }],
                        _collectionName: 'SwmgUser'
                    }
                },
                // init crud-api
                paths: {
                    '/pet/crudGetByQueryMany': { get: {
                        _collectionName: 'SwmgPet',
                        _crudApi: 'pet',
                        _schemaName: 'Pet',
                        operationId: 'crudGetByQueryMany',
                        tags: ['pet']
                    } },
                    '/store/crudGetByQueryMany': { get: {
                        _collectionName: 'SwmgOrder',
                        _crudApi: 'store',
                        _schemaName: 'Order',
                        operationId: 'crudGetByQueryMany',
                        tags: ['store']
                    } },
                    '/user/crudGetByQueryMany': { get: {
                        _collectionName: 'SwmgUser',
                        _crudApi: 'user',
                        _schemaName: 'User',
                        operationId: 'crudGetByQueryMany',
                        tags: ['user']
                    } }
                }
            }, 4);
            // transform petstore-api to swagger-mongodb's crud-api
            Object.keys(options.paths).forEach(function (path) {
                Object.keys(options.paths[path]).forEach(function (method) {
                    methodPath = options.paths[path][method];
                    // init methodPath._schemaName
                    switch (path.split('/')[1]) {
                    case 'pet':
                        methodPath._schemaName = 'Pet';
                        break;
                    case 'store':
                        methodPath._schemaName = 'Order';
                        break;
                    case 'user':
                        methodPath._schemaName = 'User';
                        break;
                    }
                    methodPath._collectionName = 'Swmg' + methodPath._schemaName;
                    delete methodPath.produces;
                    delete methodPath.responses;
                    delete methodPath.security;
                    // init jsonapi response
                    local.utility2.objectSetDefault(methodPath, { responses: {
                        200: {
                            description: '200 ok - http://jsonapi.org/format' +
                                '/#document-structure-top-level',
                            schema: { $ref: '#/definitions/JsonapiResponse{{_schemaName}}' }
                        }
                    } }, 2);
                    // init crudCreateMany / crudCreateOne / crudDeleteByIdOne / crudGetByIdOne
                    switch (methodPath.operationId) {
                    case 'addPet':
                    case 'createUser':
                    case 'placeOrder':
                        methodPath.operationId = 'crudCreateOne';
                        break;
                    case 'createUsersWithArrayInput':
                    case 'createUsersWithListInput':
                        methodPath.operationId = 'crudCreateMany';
                        break;
                    case 'deleteOrder':
                    case 'deletePet':
                    case 'deleteUser':
                        methodPath.operationId = 'crudDeleteByIdOne';
                        break;
                    case 'getOrderById':
                    case 'getPetById':
                    case 'getUserByName':
                        methodPath.operationId = 'crudGetByIdOne';
                        break;
                    }
                    // init id
                    (methodPath.parameters || []).forEach(function (paramDef) {
                        switch (paramDef.name) {
                        case 'orderId':
                        case 'petId':
                            delete paramDef.format;
                            paramDef.type = 'string';
                            break;
                        }
                    });
                });
            });
            local.swmg.apiUpdate(options);
        }());
        // init petstore-middleware
        local.middleware.middlewareList.push(function (request, response, nextMiddleware) {
            var modeNext, onNext, options;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.testTryCatch(function () {
                    modeNext = error
                        ? Infinity
                        : modeNext + 1;
                    switch (modeNext) {
                    case 1:
                        // init id
                        ((request.swmgMethodPath && request.swmgMethodPath.parameters) || [
                        ]).forEach(function (paramDef) {
                            switch (paramDef.name) {
                            case 'orderId':
                            case 'petId':
                                request.swmgParamDict.id = request.swmgParamDict[paramDef.name];
                                break;
                            }
                        });
                        // init options
                        if (request.swmgMethodPath) {
                            options = {
                                collectionName: request.swmgMethodPath._collectionName,
                                data: request.swmgParamDict,
                                operationId: request.swmgMethodPath.operationId,
                                paramDefList: request.swmgMethodPath.parameters,
                                schemaName: request.swmgMethodPath._schemaName
                            };
                        }
                        switch (request.swmgPathname) {
                        // handle pet request
                        case 'DELETE /pet/':
                        case 'GET /pet/':
                        case 'POST /pet':
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'GET /pet/findByStatus':
                            options.operationId = 'crudGetByQueryMany';
                            options.data.fields = '{}';
                            options.data.hint = '{}';
                            options.data.limit = 100;
                            options.data.query = '{"status":{"$in":' +
                                JSON.stringify(options.data.status) + '}}';
                            options.data.skip = 0;
                            options.data.sort = '{"_timeModified":-1}';
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'GET /pet/findByTags':
                            options.operationId = 'crudGetByQueryMany';
                            options.data.fields = '{}';
                            options.data.hint = '{}';
                            options.data.limit = 100;
                            options.data.query = '{"status":{"$in":' +
                                JSON.stringify(options.data.tags) + '}}';
                            options.data.skip = 0;
                            options.data.sort = '{"_timeModified":-1}';
                            options.paramDefList[0].default = 'bird,cat,dog';
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'POST /pet/':
                            options.data.upsert = true;
                            options.data.body = {
                                id: options.data.id,
                                name: options.data.name,
                                status: options.data.status
                            };
                            options.operationId = 'crudUpdateOne';
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'POST /pet//':
                            options.data.body = {
                                additionalMetadata: options.data.additionalMetadata,
                                file: options.data.file,
                                filename:
                                    request.swmgBodyParsed && request.swmgBodyParsed.filename,
                                id: options.id
                            };
                            options.data.upsert = true;
                            options.operationId = 'crudUpdateOne';
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'PUT /pet':
                            options.data.upsert = true;
                            options.operationId = 'crudReplaceOne';
                            local.swmg._crudApi(options, onNext);
                            break;
                        // handle store request
                        case 'DELETE /store/order/':
                        case 'GET /store/order/':
                        case 'POST /store/order':
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'GET /store/inventory':
                            options.data = { body: [{
                                $group: { _id: '$status', total: { $sum: 1} }
                            }, {
                                $project: { _id: 0, status: '$_id', total: '$total' }
                            }]};
                            options.operationId = 'crudAggregateMany';
                            local.swmg._crudApi(options, onNext);
                            break;
                        // handle user request
                        case 'DELETE /user/':
                        case 'GET /user/':
                        case 'POST /user/createWithArray':
                        case 'POST /user/createWithList':
                            options.optionsId = { username: request.swmgParamDict.username};
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'POST /user':
                            options.data.username = options.data.body.username;
                            options.optionsId = { username: request.swmgParamDict.username};
                            local.swmg._crudApi(options, onNext);
                            break;
                        case 'PUT /user/':
                            options.data.body.username = options.data.username;
                            options.data.upsert = true;
                            options.operationId = 'crudReplaceOne';
                            options.optionsId = { username: request.swmgParamDict.username};
                            local.swmg._crudApi(options, onNext);
                            break;
                        default:
                            nextMiddleware();
                        }
                        break;
                    default:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // respond with json-object
                        response.end(JSON.stringify(data));
                    }
                }, nextMiddleware);
            };
            onNext();
        });
        // run server-test
        local.utility2.testRunServer(local);
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
        // export local
        local.global.local = local;
        // init swagger-mongodb
        local.swmg = local.modeJs === 'browser'
            ? window.swmg
            : require('swagger-mongodb');
        // import swmg.local
        Object.keys(local.swmg.local).forEach(function (key) {
            local[key] = local[key] || local.swmg.local[key];
        });
        // init utility2
        local.utility2 = local.swmg.local.utility2;
        // init onReady
        local.utility2.onReadyInit();
    }());
    return local;
}())));
```

#### output from shell
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.testExampleJs.svg)](https://travis-ci.org/kaizhu256/node-swagger-mongodb)

#### output from phantomjs-lite
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.testExampleJs.slimerjs..png)](https://hrku01-swagger-mongodb-beta.herokuapp.com)



# npm-dependencies
- [mongodb-minimal](https://www.npmjs.com/package/mongodb-minimal)
- [swagger-ui-lite](https://www.npmjs.com/package/swagger-ui-lite)
- [utility2](https://www.npmjs.com/package/utility2)



# package-listing
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.gitLsTree.svg)](https://github.com/kaizhu256/node-swagger-mongodb)



# package.json
```json
{
    "author": "kai zhu <kaizhu256@gmail.com>",
    "bin": { "swagger-mongodb": "index.js" },
    "dependencies": {
        "mongodb-minimal": "2015.8.1",
        "swagger-ui-lite": "2015.6.2",
        "utility2": "~2015.8.5"
    },
    "description": "lightweight swagger-ui crud-middleware backed by mongodb",
    "devDependencies": {
        "phantomjs-lite": "2015.7.1"
    },
    "engines": { "node": ">=0.10 <=0.12" },
    "keywords": [
        "api",
        "browser",
        "cms", "crud",
        "mongo", "mongodb",
        "swagger", "swagger-ui",
        "web"
    ],
    "license": "MIT",
    "name": "swagger-mongodb",
    "os": ["darwin", "linux"],
    "repository" : {
        "type" : "git",
        "url" : "https://github.com/kaizhu256/node-swagger-mongodb.git"
    },
    "scripts": {
        "build-ci": "node_modules/.bin/utility2 shRun shReadmeBuild",
        "build-doc": "node_modules/.bin/utility2 shRun shReadmeExportPackageJson && \
node_modules/.bin/utility2 shRun shDocApiCreate \"{ \
exampleFileList:['example.js','test.js','index.js'], \
moduleDict:{'swagger-mongodb':{aliasList:['swmg'],exports:require('./index.js')}} \
}\"",
        "start": "npm_config_mode_auto_restart=1 node_modules/.bin/utility2 shRun node test.js",
        "test": "node_modules/.bin/utility2 shRun shReadmeExportPackageJson && \
node_modules/.bin/utility2 test test.js"
    },
    "version": "2015.8.3"
}
```



# todo
- add logging feature
- rename delete to remove for naming consistency
- migrate to travis-ci docker container build
- add cached param for crudGetByQueryMany
- add SwmgUserLoginTokenCapped
- re-enable user login/logout
- test /user/login and /user/logout
- add max / min validation
- none



# change since af87c5b9
- npm publish 2015.8.3
- lockdown npm dependencies
- none



# changelog of last 50 commits
[![screen-capture](https://kaizhu256.github.io/node-swagger-mongodb/build/screen-capture.gitLog.svg)](https://github.com/kaizhu256/node-swagger-mongodb/commits)



# internal build-script
- build.sh

```shell
# build.sh

# this shell script will run the build for this package

shBuild() {
    # this function will run the main build
    local TEST_URL || return $?

    # init env
    export npm_config_mode_slimerjs=1 || return $?
    . node_modules/.bin/utility2 && shInit || return $?

    # run npm-test on published package
    shRun shNpmTestPublished || return $?

    # test example js script
    export npm_config_timeout_exit=10000 || return $?
    MODE_BUILD=testExampleJs shRunScreenCapture shReadmeTestJs example.js || return $?
    unset npm_config_timeout_exit || return $?

    # run npm-test
    MODE_BUILD=npmTest shRunScreenCapture npm test || return $?

    # create api-doc
    npm run-script build-doc || return $?

    # if running legacy-node, then do not continue
    [ "$(node --version)" \< "v0.12" ] && return

    # deploy app to heroku
    shRun shHerokuDeploy hrku01-$npm_package_name-$CI_BRANCH || return $?

    # test deployed app to heroku
    if [ "$CI_BRANCH" = alpha ] ||
        [ "$CI_BRANCH" = beta ] ||
        [ "$CI_BRANCH" = master ]
    then
        TEST_URL="https://hrku01-$npm_package_name-$CI_BRANCH.herokuapp.com" || return $?
        TEST_URL="$TEST_URL?modeTest=phantom&timeExit={{timeExit}}" || return $?
        MODE_BUILD=herokuTest shPhantomTest "$TEST_URL" || return $?
    fi
}
shBuild

# save exit-code
EXIT_CODE=$?
# create package-listing
MODE_BUILD=gitLsTree shRunScreenCapture shGitLsTree || exit $?
# create recent changelog of last 50 commits
MODE_BUILD=gitLog shRunScreenCapture git log -50 --pretty="%ai\u000a%B" || exit $?
# if running legacy-node, then do not continue
[ "$(node --version)" \< "v0.12" ] && exit $EXIT_CODE
# upload build-artifacts to github, and if number of commits > 16, then squash older commits
COMMIT_LIMIT=16 shBuildGithubUpload || exit $?
exit $EXIT_CODE
```
