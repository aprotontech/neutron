import WebRTCClient from './apiclient/webrtc-client.js';
import HttpClient from './apiclient/http-client.js';
import { RuntimeVariables } from './helpers.js';

export default class TransferClient {
    static instance = null;


    constructor(transport) {
        this.transport = transport;

        switch (this.transport) {
            case 'webrtc':
                this.client = new WebRTCClient(
                    RuntimeVariables.getWebsocketAddress(),
                    RuntimeVariables.getClientID(),
                    RuntimeVariables.getStorageServerID(),
                    RuntimeVariables.getToken(),
                    function () {
                        RuntimeVariables.cleanup()
                        window.location.href = '/';
                    }
                );
                break;
            case 'http':
                this.client = new HttpClient();
                break;
            default:
                throw new Error(`Unsupported transport: ${this.transport}`);
        }
    }

    static get() {
        if (!TransferClient.instance) {
            throw new Error('TransferClient not initialized. Call TransferClient.init() first.');
        }
        return TransferClient.instance.client;
    }

    static init(transport = 'webrtc') {
        if (!TransferClient.instance) {
            TransferClient.instance = new TransferClient(transport);
        }
        return TransferClient.instance;
    }
}