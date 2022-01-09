import { Wretcher } from 'wretch';
import { Collection, CollectionItem, ID } from '@orpington-news/shared';

export const getCollections = (api: Wretcher) =>
  api.url('/collections').get().json<Collection[]>();

export const getCollectionItems = (
  api: Wretcher,
  collectionId: string | ID,
  pageIndex?: number
) =>
  api
    .url(`/collections/${collectionId}/items`)
    .query({ pageIndex })
    .get()
    .json<CollectionItem[]>();
