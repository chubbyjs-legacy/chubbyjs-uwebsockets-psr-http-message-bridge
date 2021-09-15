import UriFactoryInterface from '@chubbyjs/psr-http-factory/dist/UriFactoryInterface';
import UriInterface from '@chubbyjs/psr-http-message/dist/UriInterface';

class UriFactoryDouble implements UriFactoryInterface {
    createUri(uri: string): UriInterface {
        throw new Error('Method not implemented.');
    }
}

export default UriFactoryDouble;
