// @flow
import type { ElementsXhrError } from '../common/types/api';
import Base from './Base';

export default class Annotations extends Base {
    getUrl(id: string) {
        return `${this.getBaseApiUrl()}/files/${id}/annotations`;
    }

    getAnnotations(
        fileId: string,
        versionId: string,
        successCallback: Function,
        errorCallback: (e: ElementsXhrError, code: string) => void,
    ): void {
        this.get({
            id: fileId,
            successCallback,
            errorCallback,
            requestData: {
                params: {
                    fields: 'item,thread,details,message,created_by,created_at,modified_at,permissions',
                    version: versionId,
                },
            },
        });
    }
}
