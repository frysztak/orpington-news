import { Wretcher } from 'wretch';
import {
  Collection,
  CollectionItem,
  CollectionItemDetails,
  ID,
} from '@orpington-news/shared';

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

export const getItemDetails = (
  api: Wretcher,
  collectionId: ID,
  itemSlug: string
) =>
  api
    .url(`/collections/${collectionId}/item/${itemSlug}`)
    .get()
    .json<CollectionItemDetails>();

export const verifyFeedUrl = (api: Wretcher, url: string) =>
  api
    .url(`/collections/verifyUrl`)
    .post({ url })
    .json<{ title: string; description: string }>();

export const addCollection = (
  api: Wretcher,
  collection: Omit<
    Collection,
    'id' | 'slug' | 'unreadCount' | 'children' | 'dateUpdated'
  >
) => api.url(`/collections`).post(collection).json<boolean>();

export const editCollection = (
  api: Wretcher,
  collection: Omit<
    Collection,
    'slug' | 'unreadCount' | 'children' | 'dateUpdated'
  >
) => api.url(`/collections`).put(collection).json<boolean>();
