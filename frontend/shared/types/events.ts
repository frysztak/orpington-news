import { ID } from './id';

export interface UpdatingFeedsMsg {
  type: 'updatingFeeds';
  data: {
    feedIds: Array<ID>;
  };
}

export const makeUpdatingFeedsMsg = (
  data: UpdatingFeedsMsg['data']
): UpdatingFeedsMsg => ({ type: 'updatingFeeds', data });

export interface UpdatedFeedsMsg {
  type: 'updatedFeeds';
  data: {
    refreshedFeedIds: Array<ID>;
    affectedFeedIds: Array<ID>;
    unreadCount?: {
      counts: Record<ID, number>;
      updatedAt: number;
    };
  };
}

export const makeUpdatedFeedsMsg = (
  data: UpdatedFeedsMsg['data']
): UpdatedFeedsMsg => ({ type: 'updatedFeeds', data });

export interface PingMsg {
  type: 'ping';
}

export const pingMsg: PingMsg = { type: 'ping' };

export type Msg = UpdatingFeedsMsg | UpdatedFeedsMsg | PingMsg;
export type MsgType = Msg['type'];
