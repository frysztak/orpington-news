import { SimpleIntervalJob, Task } from 'toad-scheduler';
import { pingMsg } from '@orpington-news/shared';
import { logger } from '@utils';
import { sseEmit } from '@sse';

const task = new Task(
  'ping',
  () => {
    logger.info(`Ping...`);
    sseEmit(pingMsg);
  },
  (err: Error) => {
    logger.error(err);
  }
);

export const pingJob = new SimpleIntervalJob(
  { seconds: 30, runImmediately: true },
  task
);
