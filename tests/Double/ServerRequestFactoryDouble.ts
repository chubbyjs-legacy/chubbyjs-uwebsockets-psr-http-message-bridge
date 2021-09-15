import ServerRequestFactoryInterface from '@chubbyjs/psr-http-factory/dist/ServerRequestFactoryInterface';
import ServerRequestInterface from '@chubbyjs/psr-http-message/dist/ServerRequestInterface';
import UriInterface from '@chubbyjs/psr-http-message/dist/UriInterface';

class ServerRequestFactoryDouble implements ServerRequestFactoryInterface {
    createServerRequest(method: string, uri: string | UriInterface): ServerRequestInterface {
        throw new Error('Method not implemented.');
    }
}

export default ServerRequestFactoryDouble;
