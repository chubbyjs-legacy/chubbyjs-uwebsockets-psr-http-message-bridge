import { HttpResponse, RecognizedString, us_socket_context_t } from 'uWebSockets.js';

class HttpResponseDouble implements HttpResponse {
    [key: string]: any;
    writeStatus(status: RecognizedString): HttpResponse {
        throw new Error('Method not implemented.');
    }
    writeHeader(key: RecognizedString, value: RecognizedString): HttpResponse {
        throw new Error('Method not implemented.');
    }
    write(chunk: RecognizedString): boolean {
        throw new Error('Method not implemented.');
    }
    end(body?: RecognizedString, closeConnection?: boolean): HttpResponse {
        throw new Error('Method not implemented.');
    }
    tryEnd(fullBodyOrChunk: RecognizedString, totalSize: number): [boolean, boolean] {
        throw new Error('Method not implemented.');
    }
    close(): HttpResponse {
        throw new Error('Method not implemented.');
    }
    getWriteOffset(): number {
        throw new Error('Method not implemented.');
    }
    onWritable(handler: (offset: number) => boolean): HttpResponse {
        throw new Error('Method not implemented.');
    }
    onAborted(handler: () => void): HttpResponse {
        throw new Error('Method not implemented.');
    }
    onData(handler: (chunk: ArrayBuffer, isLast: boolean) => void): HttpResponse {
        throw new Error('Method not implemented.');
    }
    getRemoteAddress(): ArrayBuffer {
        throw new Error('Method not implemented.');
    }
    getRemoteAddressAsText(): ArrayBuffer {
        throw new Error('Method not implemented.');
    }
    getProxiedRemoteAddress(): ArrayBuffer {
        throw new Error('Method not implemented.');
    }
    getProxiedRemoteAddressAsText(): ArrayBuffer {
        throw new Error('Method not implemented.');
    }
    cork(cb: () => void): HttpResponse {
        throw new Error('Method not implemented.');
    }
    upgrade<T>(
        userData: T,
        secWebSocketKey: RecognizedString,
        secWebSocketProtocol: RecognizedString,
        secWebSocketExtensions: RecognizedString,
        context: us_socket_context_t,
    ): void {
        throw new Error('Method not implemented.');
    }
}

export default HttpResponseDouble;
