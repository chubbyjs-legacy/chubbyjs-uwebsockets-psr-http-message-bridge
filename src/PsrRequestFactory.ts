import ServerRequestFactoryInterface from '@chubbyjs/psr-http-factory/dist/ServerRequestFactoryInterface';
import StreamFactoryInterface from '@chubbyjs/psr-http-factory/dist/StreamFactoryInterface';
import UriFactoryInterface from '@chubbyjs/psr-http-factory/dist/UriFactoryInterface';
import { Method } from '@chubbyjs/psr-http-message/dist/RequestInterface';
import { QueryParams } from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { parse as cookieParser } from 'cookie';
import { parse as queryParser } from 'qs';
import { Duplex, PassThrough } from 'stream';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

class PsrRequestFactory {
    public constructor(
        private serverRequestFactory: ServerRequestFactoryInterface,
        private uriFactory: UriFactoryInterface,
        private streamFactory: StreamFactoryInterface,
    ) {}

    public create(req: HttpRequest, res: HttpResponse) {
        const query = req.getQuery();
        const host = req.getHeader('host');

        const uri = this.uriFactory.createUri(
            'http://' + (host ? host : 'localhost') + req.getUrl() + (query ? '?' + query : ''),
        );

        let serverRequest = this.serverRequestFactory
            .createServerRequest(req.getMethod().toUpperCase() as Method, uri)
            .withProtocolVersion('1.1')
            .withBody(this.streamFactory.createStreamFromResource(this.getStream(res)));

        const rawCookie = req.getHeader('cookie');

        if (rawCookie) {
            serverRequest = serverRequest.withCookieParams(new Map(Object.entries(cookieParser(rawCookie))));
        }

        if (query) {
            serverRequest = serverRequest.withQueryParams(queryParser(query) as QueryParams);
        }

        req.forEach((name, value) => {
            serverRequest = serverRequest.withHeader(name, value);
        });

        return serverRequest;
    }

    private getStream(res: HttpResponse): Duplex {
        const stream = new PassThrough();

        res.onData((chunk: ArrayBuffer, isLast: boolean) => {
            stream.write(Buffer.from(chunk));

            if (isLast) {
                stream.end();
            }
        });

        return stream;
    }
}

export default PsrRequestFactory;
