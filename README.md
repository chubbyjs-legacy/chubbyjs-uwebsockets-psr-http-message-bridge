# chubbyjs-uwebsockets-psr-http-message-bridge

[![CI](https://github.com/chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/workflows/CI/badge.svg?branch=master)](https://github.com/chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/badge.svg?branch=master)](https://coveralls.io/github/chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge?branch=master)
[![Infection MSI](https://badge.stryker-mutator.io/github.com/chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/master)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge.svg)](https://www.npmjs.com/package/@chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyjs_chubbyjs-uwebsockets-psr-http-message-bridge)

## Description

A uWebSockets.js req/res psr-htt-message bridge.

## Requirements

 * node: 12
 * [@chubbyjs/psr-http-factory][2]: ^1.1.0
 * [@chubbyjs/psr-http-message][3]: ^1.2.1
 * [cookie][4]: ^0.4.1
 * [qs][5]: ^6.10.1
 * [uWebSockets.js][6]: github:uNetworking/uWebSockets.js#v20.6.0

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge][1].

```sh
npm i @chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge@1.3.0 \
    @chubbyjs/chubbyjs-http-message@1.1.1
```

## Usage

```ts
import PsrRequestFactory from '@chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/dist/PsrRequestFactory';
import ResponseFactory from '@chubbyjs/chubbyjs-http-message/dist/Factory/ResponseFactory';
import ServerRequestFactory from '@chubbyjs/chubbyjs-http-message/dist/Factory/ServerRequestFactory';
import StreamFactory from '@chubbyjs/chubbyjs-http-message/dist/Factory/StreamFactory';
import UriFactory from '@chubbyjs/chubbyjs-http-message/dist/Factory/UriFactory';
import UwebsocketResponseEmitter from '@chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge/dist/UwebsocketResponseEmitter';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

const responseFactory = new ResponseFactory();

const psrRequestFactory = new PsrRequestFactory(
    new ServerRequestFactory(),
    new UriFactory(),
    new StreamFactory()
);

const uwebsocketResponseEmitter = new UwebsocketResponseEmitter();

require('uWebSockets.js')
    .App()
    .any('/*', (res: HttpResponse, req: HttpRequest) => {
        const serverRequest = psrRequestFactory.create(req, res);
        const response = responseFactory.createResponse(200);

        serverRequest.getBody().pipe(response.getBody());

        uwebsocketResponseEmitter.emit(response, res);
    })
    .listen('0.0.0.0', 8080, (listenSocket: unknown) => {
        if (listenSocket) {
            console.log('Listening to port 0.0.0.0:8080');
        }
    });
```

## Copyright

Dominik Zogg 2021

[1]: https://www.npmjs.com/package/@chubbyjs/chubbyjs-uwebsockets-psr-http-message-bridge

[2]: https://www.npmjs.com/package/@chubbyjs/psr-http-factory
[3]: https://www.npmjs.com/package/@chubbyjs/psr-http-message
[4]: https://www.npmjs.com/package/cookie
[5]: https://www.npmjs.com/package/qs
[6]: https://www.npmjs.com/package/uwebsockets.js
