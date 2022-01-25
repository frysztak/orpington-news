import { ID } from '.';

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
    feedIds: Array<ID>;
  };
}

export const makeUpdatedFeedsMsg = (
  data: UpdatedFeedsMsg['data']
): UpdatedFeedsMsg => ({ type: 'updatedFeeds', data });

export type Msg = UpdatingFeedsMsg | UpdatedFeedsMsg;
export type MsgType = Msg['type'];
