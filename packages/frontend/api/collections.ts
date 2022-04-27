import { Wretcher } from 'wretch';
import {
  Collection,
  CollectionItem,
  CollectionItemDetails,
  CollectionLayout,
  FlatCollection,
  ID,
} from '@orpington-news/shared';

export const getCollections = (api: Wretcher) =>
  api.url('/collections').get().json<FlatCollection[]>();

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

export const getItemDetails = (api: Wretcher, collectionId: ID, itemId: ID) =>
  api
    .url(`/collections/${collectionId}/item/${itemId}`)
    .get()
    .json<CollectionItemDetails>();

export const setDateRead = (
  api: Wretcher,
  collectionId: ID,
  itemId: ID,
  dateRead: number | null
) =>
  api
    .url(`/collections/${collectionId}/item/${itemId}/dateRead`)
    .put({ dateRead })
    .json<boolean>();

export const verifyFeedUrl = (api: Wretcher, url: string) =>
  api
    .url(`/collections/verifyUrl`)
    .post({ url })
    .json<{ title: string; description: string }>();

export const addCollection = (
  api: Wretcher,
  collection: Omit<
    Collection,
    'id' | 'unreadCount' | 'children' | 'dateUpdated'
  >
) => api.url(`/collections`).post(collection).json<boolean>();

export const editCollection = (
  api: Wretcher,
  collection: Omit<Collection, 'unreadCount' | 'children' | 'dateUpdated'>
) => api.url(`/collections`).put(collection).json<boolean>();

export const deleteCollection = (api: Wretcher, collectionId: ID) =>
  api.url(`/collections/${collectionId}`).delete().json<{ ids: ID[] }>();

export const markCollectionAsRead = (api: Wretcher, collectionId: ID) =>
  api
    .url(`/collections/${collectionId}/markAsRead`)
    .post()
    .json<{ ids: ID[] }>();

export const refreshCollection = (api: Wretcher, collectionId: ID | 'home') =>
  api.url(`/collections/${collectionId}/refresh`).post().json<{ ids: ID[] }>();

export interface MoveCollectionBody {
  collectionId: ID;
  newParentId: ID | null;
  newOrder: number;
}

export const moveCollection = (api: Wretcher, body: MoveCollectionBody) =>
  api.url(`/collections/move`).post(body).json<FlatCollection[]>();

export const setCollectionLayout = (
  api: Wretcher,
  collectionId: ID | 'home',
  layout: CollectionLayout
) =>
  api
    .url(`/collections/${collectionId}/layout`)
    .put({ layout })
    .json<boolean>();
