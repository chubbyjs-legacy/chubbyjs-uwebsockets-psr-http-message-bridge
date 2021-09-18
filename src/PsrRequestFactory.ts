import ServerRequestFactoryInterface from '@chubbyjs/psr-http-factory/dist/ServerRequestFactoryInterface';
import StreamFactoryInterface from '@chubbyjs/psr-http-factory/dist/StreamFactoryInterface';
import UriFactoryInterface from '@chubbyjs/psr-http-factory/dist/UriFactoryInterface';
import { Method } from '@chubbyjs/psr-http-message/dist/RequestInterface';
import { QueryParams } from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import { parse as cookieParser } from 'cookie';
import { parse as queryParser } from 'qs';
import { Duplex, PassThrough } from 'stream';
import { HttpRequest, HttpResponse } from 'uWebSockets.js';

type UriOptions = { schema: 'http' | 'https'; host?: string } | boolean;

class PsrRequestFactory {
    public constructor(
        private serverRequestFactory: ServerRequestFactoryInterface,
        private uriFactory: UriFactoryInterface,
        private streamFactory: StreamFactoryInterface,
        private uriOptions: UriOptions = false,
    ) {}

    public create(req: HttpRequest, res: HttpResponse) {
        const uri = this.uriFactory.createUri(this.getUri(req));

        let serverRequest = this.serverRequestFactory
            .createServerRequest(req.getMethod().toUpperCase() as Method, uri)
            .withProtocolVersion('1.1')
            .withBody(this.streamFactory.createStreamFromResource(this.getStream(res)));

        const rawCookie = req.getHeader('cookie');

        if (rawCookie) {
            serverRequest = serverRequest.withCookieParams(new Map(Object.entries(cookieParser(rawCookie))));
        }

        const query = uri.getQuery();

        if (query) {
            serverRequest = serverRequest.withQueryParams(queryParser(query) as QueryParams);
        }

        req.forEach((name, value) => {
            serverRequest = serverRequest.withHeader(name, value);
        });

        return serverRequest;
    }

    private getUri(req: HttpRequest): string {
        const query = req.getQuery();
        const pathQuery = req.getUrl() + (query ? '?' + query : '');

        if (true === this.uriOptions) {
            const headers: Map<string, string> = new Map();
            const missingHeaders = ['x-forwarded-proto', 'x-forwarded-host', 'x-forwarded-port'].filter((name) => {
                const value = req.getHeader(name);
                headers.set(name, value);

                return !value;
            });

            if (missingHeaders.length > 0) {
                throw new Error(`Missing "${missingHeaders.join('", "')}" header(s).`);
            }

            return (
                headers.get('x-forwarded-proto') +
                '://' +
                headers.get('x-forwarded-host') +
                ':' +
                headers.get('x-forwarded-port') +
                pathQuery
            );
        }

        const hostHeader = req.getHeader('host');

        const schema = typeof this.uriOptions === 'object' ? this.uriOptions.schema : 'http';

        const host =
            typeof this.uriOptions === 'object' && this.uriOptions.host
                ? this.uriOptions.host
                : hostHeader
                ? hostHeader
                : 'localhost';

        return schema + '://' + host + pathQuery;
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
