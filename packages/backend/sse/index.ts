import { EventEmitter } from 'events';

export const sseEmitter = new EventEmitter();
export const sseEmit = (data: any) => {
  sseEmitter.emit('push', JSON.stringify(data));
};
