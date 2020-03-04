/**
 * @flow
 * @file Active state component for Activity Feed
 */
import * as React from 'react';
import classNames from 'classnames';
import getProp from 'lodash/get';
import Button from '../../../../components/button';
import NavButton from '../../../common/nav-button';
import AppActivity from '../app-activity';
import Comment from '../comment';
import TaskNew from '../task-new';
import Version, { CollapsedVersion } from '../version';
import withErrorHandling from '../../withErrorHandling';
import type { FocusableFeedItemType, FeedItem, FeedItems } from '../../../../common/types/feed';
import type { SelectorItems, User } from '../../../../common/types/core';
import type { GetAvatarUrlCallback, GetProfileUrlCallback } from '../../../common/flowTypes';
import type { Translations } from '../../flowTypes';

type Props = {
    activeFeedEntryId?: string,
    activeFeedEntryType?: FocusableFeedItemType,
    activeFeedItemRef: { current: null | HTMLElement },
    approverSelectorContacts?: SelectorItems<>,
    currentUser?: User,
    getApproverWithQuery?: Function,
    getAvatarUrl: GetAvatarUrlCallback,
    getMentionWithQuery?: Function,
    getUserProfileUrl?: GetProfileUrlCallback,
    items: FeedItems,
    mentionSelectorContacts?: SelectorItems<>,
    onAnnotationChange?: Function,
    onAppActivityDelete?: Function,
    onCommentDelete?: Function,
    onCommentEdit?: Function,
    onTaskAssignmentUpdate?: Function,
    onTaskDelete?: Function,
    onTaskEdit?: Function,
    onTaskModalClose?: Function,
    onVersionInfo?: Function,
    translations?: Translations,
};

const ActiveState = ({
    activeFeedEntryId,
    activeFeedEntryType,
    activeFeedItemRef,
    approverSelectorContacts,
    currentUser,
    items,
    mentionSelectorContacts,
    getMentionWithQuery,
    onAppActivityDelete,
    onAnnotationChange,
    onCommentDelete,
    onCommentEdit,
    onTaskDelete,
    onTaskEdit,
    onTaskAssignmentUpdate,
    onTaskModalClose,
    onVersionInfo,
    translations,
    getApproverWithQuery,
    getAvatarUrl,
    getUserProfileUrl,
}: Props): React.Node => {
    const activeEntry = items.find(({ id, type }) => id === activeFeedEntryId && type === activeFeedEntryType);

    return (
        <ul className="bcs-activity-feed-active-state">
            {items.map((item: FeedItem) => {
                const isFocused = item === activeEntry;
                const refValue = isFocused ? activeFeedItemRef : undefined;

                switch (item.type) {
                    case 'comment':
                        return (
                            <li
                                key={item.type + item.id}
                                className={classNames('bcs-activity-feed-comment', { 'bcs-is-focused': isFocused })}
                                data-testid="comment"
                                ref={refValue}
                            >
                                <Comment
                                    {...item}
                                    currentUser={currentUser}
                                    getAvatarUrl={getAvatarUrl}
                                    getMentionWithQuery={getMentionWithQuery}
                                    getUserProfileUrl={getUserProfileUrl}
                                    mentionSelectorContacts={mentionSelectorContacts}
                                    onDelete={onCommentDelete}
                                    onEdit={onCommentEdit}
                                    permissions={{
                                        can_delete: getProp(item.permissions, 'can_delete', false),
                                        can_edit: getProp(item.permissions, 'can_edit', false),
                                    }}
                                    translations={translations}
                                />
                            </li>
                        );
                    case 'task':
                        return (
                            <li
                                key={item.type + item.id}
                                className={classNames('bcs-activity-feed-task-new', { 'bcs-is-focused': isFocused })}
                                data-testid="task"
                                ref={refValue}
                            >
                                <TaskNew
                                    {...item}
                                    approverSelectorContacts={approverSelectorContacts}
                                    currentUser={currentUser}
                                    getApproverWithQuery={getApproverWithQuery}
                                    getAvatarUrl={getAvatarUrl}
                                    getUserProfileUrl={getUserProfileUrl}
                                    onAssignmentUpdate={onTaskAssignmentUpdate}
                                    onDelete={onTaskDelete}
                                    onEdit={onTaskEdit}
                                    onModalClose={onTaskModalClose}
                                    translations={translations}
                                />
                            </li>
                        );
                    case 'file_version':
                        return (
                            <li key={item.type + item.id} className="bcs-version-item" data-testid="version">
                                {item.versions ? (
                                    // $FlowFixMe
                                    <CollapsedVersion {...item} onInfo={onVersionInfo} />
                                ) : (
                                    // $FlowFixMe
                                    <Version {...item} onInfo={onVersionInfo} />
                                )}
                            </li>
                        );
                    case 'app_activity':
                        return (
                            <li
                                key={item.type + item.id}
                                className="bcs-activity-feed-app-activity"
                                data-testid="app-activity"
                            >
                                <AppActivity currentUser={currentUser} onDelete={onAppActivityDelete} {...item} />
                            </li>
                        );
                    case 'annotation':
                        return (
                            <li
                                key={item.type + item.id}
                                className={classNames('bcs-activity-feed-comment', { 'bcs-is-focused': isFocused })}
                                data-test-id="annotation"
                            >
                                <Comment
                                    {...item}
                                    currentUser={currentUser}
                                    getAvatarUrl={getAvatarUrl}
                                    getMentionWithQuery={getMentionWithQuery}
                                    getUserProfileUrl={getUserProfileUrl}
                                    tagged_message={item.message}
                                    translations={translations}
                                >
                                    <NavButton
                                        className="bcs-Annotation-link"
                                        component={Button}
                                        onClick={() => onAnnotationChange && onAnnotationChange(item.id)}
                                        to={`/activity/annotations/${item.id}`}
                                    >
                                        Go to page {item.details.location.page}
                                    </NavButton>
                                </Comment>
                            </li>
                        );
                    default:
                        return null;
                }
            })}
        </ul>
    );
};

export { ActiveState as ActiveStateComponent };
export default withErrorHandling(ActiveState);
