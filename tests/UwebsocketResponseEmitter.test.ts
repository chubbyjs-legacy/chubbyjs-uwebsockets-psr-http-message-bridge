import ArgumentCallback from '@chubbyjs/chubbyjs-mock/dist/Argument/ArgumentCallback';
import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls, { mockByCallsUsed } from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ResponseInterface from '@chubbyjs/psr-http-message/dist/ResponseInterface';
import { describe, expect, test } from '@jest/globals';
import { PassThrough } from 'stream';
import { HttpResponse } from 'uWebSockets.js';
import UwebsocketResponseEmitter from '../src/UwebsocketResponseEmitter';
import HttpResponseDouble from './Double/HttpResponseDouble';
import ResponseDouble from './Double/ResponseDouble';

const mockByCalls = new MockByCalls();

describe('UwebsocketResponseEmitter', () => {
    describe('emit', () => {
        test('successful', () => {
            const write1 = '{"key":';
            const write2 = '"value"}';

            const responseBody = new PassThrough();
            responseBody.write(write1);
            responseBody.end(write2);

            const response = mockByCalls.create<ResponseInterface>(ResponseDouble, [
                Call.create('getStatusCode').with().willReturn(200),
                Call.create('getReasonPhrase').with().willReturn('OK'),
                Call.create('getHeaders')
                    .with()
                    .willReturn(
                        new Map<string, Array<string>>([
                            ['Set-Cookie', ['key=value', 'key2=value2']],
                            ['Content-Type', ['application/json']],
                            ['Content-Length', ['0']],
                        ]),
                    ),
                Call.create('getBody').with().willReturn(responseBody),
            ]);

            const res = mockByCalls.create<HttpResponse>(HttpResponseDouble, [
                Call.create('writeStatus').with('200 OK').willReturnSelf(),
                Call.create('writeHeader').with('Set-Cookie', 'key=value, key2=value2').willReturnSelf(),
                Call.create('writeHeader').with('Content-Type', 'application/json').willReturnSelf(),
                Call.create('writeHeader').with('Content-Length', '0').willReturnSelf(),
                Call.create('onAborted')
                    .with(
                        new ArgumentCallback((callback: Function) => {
                            expect(`${callback}`).toMatch(/undefined/);
                        }),
                    )
                    .willReturnSelf(),
                Call.create('write')
                    .with(
                        new ArgumentCallback((chunk: unknown) => {
                            expect(`${chunk}`).toBe(write1);
                        }),
                    )
                    .willReturnSelf(),
                Call.create('write')
                    .with(
                        new ArgumentCallback((chunk: unknown) => {
                            expect(`${chunk}`).toBe(write2);
                        }),
                    )
                    .willReturnSelf(),
                Call.create('end')
                    .with()
                    .willReturn(() => {
                        // check here cause it's non blocking
                        expect(mockByCallsUsed(res)).toBe(true);

                        return res;
                    }),
            ]);

            const uwebsocketResponseEmitter = new UwebsocketResponseEmitter();
            uwebsocketResponseEmitter.emit(response, res);

            expect(mockByCallsUsed(response)).toBe(true);
        });
    });
});
