import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';
import Tinypool from 'tinypool';
import path from 'path';
import { pool } from '@db';
import { DBCollection, getCollectionsToRefresh } from '@db/collections';
import { logger } from '@utils/logger';
import {
  isRejected,
  makeUpdatedFeedsMsg,
  makeUpdatingFeedsMsg,
} from '@orpington-news/shared';
import { sseEmit } from '@sse';

const pathPrefix = process.env.NODE_ENV === 'development' ? './dist' : '.';
const workerPool = new Tinypool({
  filename: path.join(pathPrefix, './fetchRSS.worker.mjs'),
  maxThreads: 2,
});

const updateCollection = async (collection: DBCollection) => {
  return workerPool.run(collection).finally(() => {
    sseEmit(makeUpdatedFeedsMsg({ feedIds: [collection.id] }));
  });
};

export const updateCollections = (collections: readonly DBCollection[]) => {
  logger.info(`Found ${collections.length} feeds to update...`);
  if (collections.length) {
    sseEmit(
      makeUpdatingFeedsMsg({
        feedIds: collections.map((c) => c.id),
      })
    );
  }

  return Promise.allSettled(collections.map(updateCollection)).then(
    (results) => {
      const failures = results.filter(isRejected);
      if (failures.length === 0) {
        logger.info(`Feeds updated successfully!`);
        return true;
      } else {
        logger.info(`Feed updated, but with following errors:`);
        for (const failure of failures) {
          // TODO: we should probably somehow inform user about that
          logger.error(failure.reason);
        }
        return false;
      }
    }
  );
};

const task = new AsyncTask(
  'fetchRSS',
  () => {
    logger.info(`Starting to update feeds...`);
    return pool
      .any(getCollectionsToRefresh())
      .then(updateCollections)
      .then(() => void 0);
  },
  (err: Error) => {
    logger.error(err);
  }
);

export const fetchRSSJob = new SimpleIntervalJob(
  { minutes: 5, runImmediately: true },
  task
);
