import { HttpRequest, RecognizedString } from 'uWebSockets.js';

class HttpRequestDouble implements HttpRequest {
    getHeader(lowerCaseKey: RecognizedString): string {
        throw new Error('Method not implemented.');
    }
    getParameter(index: number): string {
        throw new Error('Method not implemented.');
    }
    getUrl(): string {
        throw new Error('Method not implemented.');
    }
    getMethod(): string {
        throw new Error('Method not implemented.');
    }
    getQuery(): string;
    getQuery(key: string): string;
    getQuery(key?: any): string {
        throw new Error('Method not implemented.');
    }
    forEach(cb: (key: string, value: string) => void): void {
        throw new Error('Method not implemented.');
    }
    setYield(_yield: boolean): HttpRequest {
        throw new Error('Method not implemented.');
    }
}

export default HttpRequestDouble;
