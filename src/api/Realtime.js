// @flow
import axios from 'axios';
import getProp from 'lodash/get';
import noop from 'lodash/noop';
import TokenService from '../util/TokenService';
import { DEFAULT_HOSTNAME_API } from '../constants';
import { getTypedFileId } from '../util/file';

const STREAM_NEW_CHANGE = 'new_change';
const STREAM_RECONNECT = 'reconnect';

export default class RealtimeEvents {
    apiHost: string;

    apiUrl: string;

    axios: Axios;

    axiosSource: CancelTokenSource;

    callback: Function = noop;

    isRelevant = (entry: Object) => getProp(entry, 'source.item.id') === this.itemId;

    isStreamReady = false;

    isSubscribed = false;

    itemId: ?string;

    streamPosition: ?number;

    streamUrl: ?string;

    timeoutId: TimeoutID;

    token: ?string | Function;

    constructor({ apiHost, token }: Options) {
        this.apiHost = apiHost || DEFAULT_HOSTNAME_API;
        this.apiUrl = `${this.getBaseApiUrl()}/events`;
        this.axios = axios.create();
        this.axiosSource = axios.CancelToken.source();
        this.token = token;
    }

    destroy() {
        clearTimeout(this.timeoutId);

        // Cancel in-flight request
        if (this.axiosSource) {
            this.axiosSource.cancel();
        }

        this.isSubscribed = false;
        this.streamPosition = null;
        this.streamUrl = null;
    }

    handleError(error: Error) {
        console.error(error);
    }

    getBaseApiUrl(): string {
        const suffix: string = this.apiHost.endsWith('/') ? '2.0' : '/2.0';
        return `${this.apiHost}${suffix}`;
    }

    // TODO: Share this code with api/Base.js
    async setToken(fileId: string) {
        const typedId = getTypedFileId(fileId);
        const token = await TokenService.getWriteToken(typedId, this.token);

        if (token) {
            this.itemId = fileId;
            this.axios.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
    }

    async fetchEvents() {
        try {
            const response = await this.axios.get(this.apiUrl, {
                params: {
                    stream_position: this.streamPosition ? this.streamPosition : 'now',
                },
            });
            const entries = getProp(response, 'data.entries');
            const position = getProp(response, 'data.next_stream_position');

            if (!entries || !position) {
                throw new Error('Invalid payload in realtime event notification');
            }

            // Stream position must be updated
            this.streamPosition = position;

            const events = entries.filter(this.isRelevant);

            if (events.length > 0) {
                this.callback({ events, position });
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async fetchStream() {
        try {
            const response = await this.axios.options(this.apiUrl);
            const stream = getProp(response, 'data.entries[0]');

            if (!stream) {
                throw new Error('Invalid response from realtime endpoint');
            }

            this.isStreamReady = true;
            this.streamUrl = stream.url;
        } catch (error) {
            this.handleError(error);
        }
    }

    async subscribe({ callback = noop, fileId }: Object = {}) {
        if (this.isSubscribed) {
            return;
        }

        this.callback = callback;
        this.isSubscribed = true;

        try {
            await this.setToken(fileId);
            await this.fetchEvents();
            await this.fetchStream();
            await this.subscribeStream();
        } catch (error) {
            this.handleError(error);
        }

        window.addEventListener('beforeunload', this.destroy);
    }

    async subscribeStream() {
        // Only subscribe if the stream is ready
        if (!this.isStreamReady) {
            return;
        }

        try {
            const response = await this.axios.get(this.streamUrl, {
                cancelToken: this.axiosSource.token,
                transformRequest: [
                    (data, headers) => {
                        // Realtime subscription does not require authentication
                        delete headers.common.Authorization;
                        return data;
                    },
                ],
            });
            const message = getProp(response, 'data.message');

            switch (message) {
                case STREAM_NEW_CHANGE: {
                    await this.fetchEvents();
                    await this.subscribeStream();
                    break;
                }
                case STREAM_RECONNECT: {
                    await this.subscribeStream();
                    break;
                }
                default: {
                    throw new Error('Invalid payload from realtime stream');
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }
}
