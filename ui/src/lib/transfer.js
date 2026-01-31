import WebRTCClient from './apiclient/webrtc-client.js';
import HttpClient from './apiclient/http-client.js';

export default class TransferClient {
    static instance = null;

    constructor(transport, token) {
        this.transport = transport;
        this.token = token;

        switch (this.transport) {
            case 'webrtc':
                this.client = new WebRTCClient(this.token);
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

    static init(transport = 'webrtc', token = '') {
        if (!TransferClient.instance) {
            TransferClient.instance = new TransferClient(transport, token);
        }
        return TransferClient.instance;
    }
}