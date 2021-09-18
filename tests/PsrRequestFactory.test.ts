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
        test('successful', () => {
            const path = '/path';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(''),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getHeader').with('host').willReturn(''),
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

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn('')]);

            const serverRequest = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const serverRequestWithBody = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withBody').with(new ArgumentInstanceOf(PassThrough)).willReturn(serverRequest),
            ]);

            const serverRequestWithProtocolVersion = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withProtocolVersion').with('1.1').willReturn(serverRequestWithBody),
            ]);

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

            expect(psrRequestFactory.create(req, res)).toBe(serverRequest);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(uri)).toBe(true);
            expect(mockByCallsUsed(serverRequest)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
            expect(mockByCallsUsed(streamFactory)).toBe(true);
        });

        test('successful maximal', () => {
            const path = '/path';
            const query = 'key1[key11]=value11&key2[]=value21&key2[]=value22';
            const cookie = 'name=value; name2=value2; name3=value3';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(query),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getHeader').with('host').willReturn('localhost:8080'),
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

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn(query)]);

            const serverRequest = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const serverRequestWithHeaderCookie = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withHeader').with('cookie', cookie).willReturn(serverRequest),
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

            expect(psrRequestFactory.create(req, res)).toBe(serverRequest);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(uri)).toBe(true);
            expect(mockByCallsUsed(serverRequest)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithHeaderCookie)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithHeaderHost)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithQueryParams)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithCookieParams)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
            expect(mockByCallsUsed(streamFactory)).toBe(true);
        });

        test('failed with reverse proxy cause missing headers', () => {
            const path = '/path';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(''),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getHeader').with('x-forwarded-proto').willReturn(''),
                Call.create('getHeader').with('x-forwarded-host').willReturn(''),
                Call.create('getHeader').with('x-forwarded-port').willReturn(''),
            ]);

            const res = mockByCalls.create<HttpResponse>(HttpResponseDouble);

            const serverRequestFactory = mockByCalls.create<ServerRequestFactoryInterface>(ServerRequestFactoryDouble);

            const uriFactory = mockByCalls.create<UriFactoryInterface>(UriFactoryDouble);

            const streamFactory = mockByCalls.create<StreamFactoryInterface>(StreamFactoryDouble);

            const psrRequestFactory = new PsrRequestFactory(serverRequestFactory, uriFactory, streamFactory, true);

            expect(() => {
                psrRequestFactory.create(req, res);
            }).toThrow('Missing "x-forwarded-proto", "x-forwarded-host", "x-forwarded-port" header(s).');

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
            expect(mockByCallsUsed(streamFactory)).toBe(true);
        });

        test('successful with reverse proxy', () => {
            const path = '/path';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(''),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getHeader').with('x-forwarded-proto').willReturn('https'),
                Call.create('getHeader').with('x-forwarded-host').willReturn('example.com'),
                Call.create('getHeader').with('x-forwarded-port').willReturn('8443'),
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

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn('')]);

            const serverRequest = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const serverRequestWithBody = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withBody').with(new ArgumentInstanceOf(PassThrough)).willReturn(serverRequest),
            ]);

            const serverRequestWithProtocolVersion = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withProtocolVersion').with('1.1').willReturn(serverRequestWithBody),
            ]);

            const serverRequestFactory = mockByCalls.create<ServerRequestFactoryInterface>(ServerRequestFactoryDouble, [
                Call.create('createServerRequest').with('GET', uri).willReturn(serverRequestWithProtocolVersion),
            ]);

            const uriFactory = mockByCalls.create<UriFactoryInterface>(UriFactoryDouble, [
                Call.create('createUri')
                    .with('https://example.com:8443' + path)
                    .willReturn(uri),
            ]);

            const streamFactory = mockByCalls.create<StreamFactoryInterface>(StreamFactoryDouble, [
                Call.create('createStreamFromResource')
                    .with(new ArgumentInstanceOf(PassThrough))
                    .willReturnCallback((stream: PassThrough) => stream),
            ]);

            const psrRequestFactory = new PsrRequestFactory(serverRequestFactory, uriFactory, streamFactory, true);

            expect(psrRequestFactory.create(req, res)).toBe(serverRequest);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(uri)).toBe(true);
            expect(mockByCallsUsed(serverRequest)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
            expect(mockByCallsUsed(streamFactory)).toBe(true);
        });

        test('successful with overriden schema and host', () => {
            const path = '/path';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(''),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getHeader').with('host').willReturn(''),
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

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn('')]);

            const serverRequest = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const serverRequestWithBody = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withBody').with(new ArgumentInstanceOf(PassThrough)).willReturn(serverRequest),
            ]);

            const serverRequestWithProtocolVersion = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withProtocolVersion').with('1.1').willReturn(serverRequestWithBody),
            ]);

            const serverRequestFactory = mockByCalls.create<ServerRequestFactoryInterface>(ServerRequestFactoryDouble, [
                Call.create('createServerRequest').with('GET', uri).willReturn(serverRequestWithProtocolVersion),
            ]);

            const uriFactory = mockByCalls.create<UriFactoryInterface>(UriFactoryDouble, [
                Call.create('createUri')
                    .with('https://example.com:8443' + path)
                    .willReturn(uri),
            ]);

            const streamFactory = mockByCalls.create<StreamFactoryInterface>(StreamFactoryDouble, [
                Call.create('createStreamFromResource')
                    .with(new ArgumentInstanceOf(PassThrough))
                    .willReturnCallback((stream: PassThrough) => stream),
            ]);

            const psrRequestFactory = new PsrRequestFactory(serverRequestFactory, uriFactory, streamFactory, {
                schema: 'https',
                host: 'example.com:8443',
            });

            expect(psrRequestFactory.create(req, res)).toBe(serverRequest);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(uri)).toBe(true);
            expect(mockByCallsUsed(serverRequest)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
            expect(mockByCallsUsed(streamFactory)).toBe(true);
        });

        test('successful with overriden schema', () => {
            const path = '/path';

            const req = mockByCalls.create<HttpRequest>(HttpRequestDouble, [
                Call.create('getQuery').with().willReturn(''),
                Call.create('getUrl').with().willReturn(path),
                Call.create('getHeader').with('host').willReturn('example.com:8443'),
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

            const uri = mockByCalls.create<UriInterface>(UriDouble, [Call.create('getQuery').with().willReturn('')]);

            const serverRequest = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble);

            const serverRequestWithBody = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withBody').with(new ArgumentInstanceOf(PassThrough)).willReturn(serverRequest),
            ]);

            const serverRequestWithProtocolVersion = mockByCalls.create<ServerRequestInterface>(ServerRequestDouble, [
                Call.create('withProtocolVersion').with('1.1').willReturn(serverRequestWithBody),
            ]);

            const serverRequestFactory = mockByCalls.create<ServerRequestFactoryInterface>(ServerRequestFactoryDouble, [
                Call.create('createServerRequest').with('GET', uri).willReturn(serverRequestWithProtocolVersion),
            ]);

            const uriFactory = mockByCalls.create<UriFactoryInterface>(UriFactoryDouble, [
                Call.create('createUri')
                    .with('https://example.com:8443' + path)
                    .willReturn(uri),
            ]);

            const streamFactory = mockByCalls.create<StreamFactoryInterface>(StreamFactoryDouble, [
                Call.create('createStreamFromResource')
                    .with(new ArgumentInstanceOf(PassThrough))
                    .willReturnCallback((stream: PassThrough) => stream),
            ]);

            const psrRequestFactory = new PsrRequestFactory(serverRequestFactory, uriFactory, streamFactory, {
                schema: 'https',
            });

            expect(psrRequestFactory.create(req, res)).toBe(serverRequest);

            expect(mockByCallsUsed(req)).toBe(true);
            expect(mockByCallsUsed(res)).toBe(true);
            expect(mockByCallsUsed(uri)).toBe(true);
            expect(mockByCallsUsed(serverRequest)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithBody)).toBe(true);
            expect(mockByCallsUsed(serverRequestWithProtocolVersion)).toBe(true);
            expect(mockByCallsUsed(serverRequestFactory)).toBe(true);
            expect(mockByCallsUsed(uriFactory)).toBe(true);
            expect(mockByCallsUsed(streamFactory)).toBe(true);
        });
    });
});
