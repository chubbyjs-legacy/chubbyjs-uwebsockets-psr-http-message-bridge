import ArgumentCallback from '@chubbyjs/chubbyjs-mock/dist/Argument/ArgumentCallback';
import ArgumentInstanceOf from '@chubbyjs/chubbyjs-mock/dist/Argument/ArgumentInstanceOf';
import Call from '@chubbyjs/chubbyjs-mock/dist/Call';
import MockByCalls, { mockByCallsUsed } from '@chubbyjs/chubbyjs-mock/dist/MockByCalls';
import ServerRequestFactoryInterface from '@chubbyjs/psr-http-factory/dist/ServerRequestFactoryInterface';
import StreamFactoryInterface from '@chubbyjs/psr-http-factory/dist/StreamFactoryInterface';
import UriFactoryInterface from '@chubbyjs/psr-http-factory/dist/UriFactoryInterface';
import ServerRequestInterface, { QueryParams } from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import UriInterface from '@chubbyjs/psr-http-message/dist/UriInterface';
import { describe, expect, test } from '@jest/globals';
import { PassThrough } from 'stream';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';
import PsrRequestFactory from '../src/PsrRequestFactory';
import HttpRequestDouble from './Double/HttpRequestDouble';
import HttpResponseDouble from './Double/HttpResponseDouble';
import ServerRequestDouble from './Double/ServerRequestDouble';
import ServerRequestFactoryDouble from './Double/ServerRequestFactoryDouble';
import StreamFactoryDouble from './Double/StreamFactoryDouble';
import UriDouble from './Double/UriDouble';
import UriFactoryDouble from './Double/UriFactoryDouble';

const mockByCalls = new MockByCalls();

describe('PsrRequestFactory', () => {
    describe('create', () => {
        test('successful minimal', () => {
            const path = '/path';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(''),
                Call.create('getHeader').with('host').willReturn(''),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getMethod').with().willReturn('get'),
                Call.create('getHeader').with('cookie').willReturn(''),
                Call.create('forEach').with(
                    new ArgumentCallback((callback: Function) => {
                        expect(`${callback}`).toMatch(/serverRequest = serverRequest.withHeader\(name, value\);/);
                    }),
                ),
            ]);

            const res = mockByCalls.create<HttpResponse>(HttpResponseDouble, [
                Call.create('onData').with(
                    new ArgumentCallback((callback: Function) => {
                        expect(`${callback}`).toMatch(/stream.write\(Buffer.from\(chunk\)\)/);
                        expect(`${callback}`).toMatch(/stream.end\(\);/);
                        callback(new ArrayBuffer(8), false);
                    }),
                ),
            ]);

            const serverRequestWithBody = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withBody').with(new ArgumentInstanceOf(PassThrough)).willReturnSelf(),
            ]);

            const serverRequestWithProtocolVersion = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withProtocolVersion').with('1.1').willReturn(serverRequestWithBody),
            ]);

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn('')]);

            const serverRequestFactory = mockByCalls.create<ServerRequestFactoryInterface>(ServerRequestFactoryDouble, [
                Call.create('createServerRequest').with('GET', uri).willReturn(serverRequestWithProtocolVersion),
            ]);

            const uriFactory = mockByCalls.create<UriFactoryInterface>(UriFactoryDouble, [
                Call.create('createUri')
                    .with('http://localhost' + path)
                    .willReturn(uri),
            ]);

            const streamFactory = mockByCalls.create<StreamFactoryInterface>(StreamFactoryDouble, [
                Call.create('createStreamFromResource')
                    .with(new ArgumentInstanceOf(PassThrough))
                    .willReturnCallback((stream: PassThrough) => stream),
            ]);

            const psrRequestFactory = new PsrRequestFactory(serverRequestFactory, uriFactory, streamFactory);

            expect(psrRequestFactory.create(req, res)).toBe(serverRequestWithBody);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
        });

        test('successful maximal', () => {
            const path = '/path';
            const query = 'key1[key11]=value11&key2[]=value21&key2[]=value22';
            const cookie = 'name=value; name2=value2; name3=value3';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(query),
                Call.create('getHeader').with('host').willReturn('localhost:8080'),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getMethod').with().willReturn('get'),
                Call.create('getHeader').with('cookie').willReturn(cookie),
                Call.create('forEach').with(
                    new ArgumentCallback((callback: Function) => {
                        expect(`${callback}`).toMatch(/serverRequest = serverRequest.withHeader\(name, value\);/);
                        callback('host', 'localhost:8080');
                        callback('cookie', cookie);
                    }),
                ),
            ]);

            const res = mockByCalls.create<HttpResponse>(HttpResponseDouble, [
                Call.create('onData').with(
                    new ArgumentCallback((callback: Function) => {
                        expect(`${callback}`).toMatch(/stream.write\(Buffer.from\(chunk\)\);/);
                        expect(`${callback}`).toMatch(/stream.end\(\);/);
                        callback(new ArrayBuffer(8), true);
                    }),
                ),
            ]);

            const serverRequestWithHeaderCookie = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withHeader').with('cookie', cookie).willReturnSelf(),
            ]);

            const serverRequestWithHeaderHost = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withHeader').with('host', 'localhost:8080').willReturn(serverRequestWithHeaderCookie),
            ]);

            const serverRequestWithQueryParams = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withQueryParams')
                    .with(
                        new ArgumentCallback((queryParams: QueryParams) => {
                            expect(queryParams).toEqual({
                                key1: {
                                    key11: 'value11',
                                },
                                key2: ['value21', 'value22'],
                            });
                        }),
                    )
                    .willReturn(serverRequestWithHeaderHost),
            ]);

            const serverRequestWithCookieParams = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withCookieParams')
                    .with(
                        new ArgumentCallback((cookieParams: Map<string, string>) => {
                            expect(cookieParams).toEqual(
                                new Map<string, string>([
                                    ['name', 'value'],
                                    ['name2', 'value2'],
                                    ['name3', 'value3'],
                                ]),
                            );
                        }),
                    )
                    .willReturn(serverRequestWithQueryParams),
            ]);

            const serverRequestWithBody = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withBody')
                    .with(new ArgumentInstanceOf(PassThrough))
                    .willReturn(serverRequestWithCookieParams),
            ]);

            const serverRequestWithProtocolVersion = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withProtocolVersion').with('1.1').willReturn(serverRequestWithBody),
            ]);

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn(query)]);

            const serverRequestFactory = mockByCalls.create<ServerRequestFactoryInterface>(ServerRequestFactoryDouble, [
                Call.create('createServerRequest').with('GET', uri).willReturn(serverRequestWithProtocolVersion),
            ]);

            const uriFactory = mockByCalls.create<UriFactoryInterface>(UriFactoryDouble, [
                Call.create('createUri')
                    .with('http://localhost:8080' + path + '?' + query)
                    .willReturn(uri),
            ]);

            const streamFactory = mockByCalls.create<StreamFactoryInterface>(StreamFactoryDouble, [
                Call.create('createStreamFromResource')
                    .with(new ArgumentInstanceOf(PassThrough))
                    .willReturnCallback((stream: PassThrough) => stream),
            ]);

            const psrRequestFactory = new PsrRequestFactory(serverRequestFactory, uriFactory, streamFactory);

            expect(psrRequestFactory.create(req, res)).toBe(serverRequestWithHeaderCookie);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithHeaderCookie)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithHeaderHost)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithQueryParams)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithCookieParams)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
        });
    });
});
