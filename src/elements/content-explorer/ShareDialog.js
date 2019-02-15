/**
 * @flow
 * @file Content Explorer Delete Confirmation Dialog
 * @author Box
 */

import React from 'react';
import Modal from 'react-modal';
import { injectIntl, FormattedMessage } from 'react-intl';
import Button from '../../components/button/Button';
import messages from '../common/messages';
import ShareAccessSelect from '../common/share-access-select';
import TextInputWithCopyButton from '../../components/text-input-with-copy-button';
import { CLASS_MODAL_CONTENT, CLASS_MODAL_OVERLAY, CLASS_MODAL } from '../../constants';
import './ShareDialog.scss';

type Props = {
    appElement: HTMLElement,
    canSetShareAccess: boolean,
    isLoading: boolean,
    isOpen: boolean,
    item: BoxItem,
    onCancel: Function,
    onShareAccessChange: Function,
    parentElement: HTMLElement,
} & InjectIntlProvidedProps;

const ShareDialog = ({
    isOpen,
    canSetShareAccess,
    onShareAccessChange,
    onCancel,
    item,
    isLoading,
    parentElement,
    appElement,
    intl,
}: Props) => {
    const { shared_link: sharedLink }: BoxItem = item;
    const { url } = sharedLink || {
        url: intl.formatMessage(messages.shareDialogNone),
    };

    return (
        <Modal
            appElement={appElement}
            className={CLASS_MODAL_CONTENT}
            contentLabel={intl.formatMessage(messages.shareDialogLabel)}
            isOpen={isOpen}
            onRequestClose={onCancel}
            overlayClassName={CLASS_MODAL_OVERLAY}
            parentSelector={() => parentElement}
            portalClassName={`${CLASS_MODAL} be-modal-share`}
        >
            <div className="be-modal-content">
                <TextInputWithCopyButton
                    disabled={!sharedLink}
                    label={<FormattedMessage {...messages.shareDialogText} />}
                    value={url}
                />
            </div>
            <div className="be-modal-btns">
                <ShareAccessSelect
                    canSetShareAccess={canSetShareAccess}
                    className="bce-shared-access-select"
                    item={item}
                    onChange={onShareAccessChange}
                />
                <Button isLoading={isLoading} onClick={onCancel} type="button">
                    <FormattedMessage {...messages.close} />
                </Button>
            </div>
        </Modal>
    );
};

export default injectIntl(ShareDialog);
