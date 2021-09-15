import ResponseInterface from '@chubbyjs/psr-http-message/dist/ResponseInterface';
import { HttpResponse } from 'uWebSockets.js';

class UwebsocketResponseEmitter {
    public emit(response: ResponseInterface, res: HttpResponse): void {
        res.writeStatus(`${response.getStatusCode()} ${response.getReasonPhrase()}`);

        response.getHeaders().forEach((value, name) => {
            res.writeHeader(name, value.join(', '));
        });

        res.onAborted(() => undefined);

        const body = response.getBody();

        body.on('data', (data: Buffer) => res.write(data));
        body.on('end', () => res.end());
    }
}

export default UwebsocketResponseEmitter;
