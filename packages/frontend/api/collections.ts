import { Wretcher } from 'wretch';
import { Collection } from '@orpington-news/shared';

export const getCollections = (api: Wretcher) =>
  api.url('/collections').get().json<Collection[]>();
