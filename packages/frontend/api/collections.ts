import {
  AddCollection,
  Collection,
  CollectionItem,
  CollectionLayout,
  ID,
  UpdateCollection,
} from '@orpington-news/shared';
import type { Wretch } from '@api';

export const getCollections = (api: Wretch) =>
  api.url('/collections').get().json<Collection[]>();

export const getCollectionItems = (
  api: Wretch,
  signal: AbortSignal | undefined,
  collectionId: string | ID,
  pageIndex?: number
) =>
  api
    .options({ signal })
    .url(`/collections/${collectionId}/items`)
    .query({ pageIndex })
    .get()
    .json<CollectionItem[]>();

export const getItemDetails = (api: Wretch, collectionId: ID, itemId: ID) =>
  api
    .url(`/collections/${collectionId}/item/${itemId}`)
    .get()
    .json<CollectionItem>();

export const setDateRead = (
  api: Wretch,
  collectionId: ID,
  itemId: ID,
  dateRead: number | null
) =>
  api
    .url(`/collections/${collectionId}/item/${itemId}/dateRead`)
    .put({ dateRead })
    .json<boolean>();

export const verifyFeedUrl = (api: Wretch, url: string) =>
  api
    .url(`/collections/verifyUrl`)
    .post({ url })
    .json<{ title: string; description: string; feedUrl: string }>();

export const addCollection = (
  api: Wretch,
  collection: Omit<AddCollection, 'layout'>
) => api.url(`/collections`).post(collection).json<Collection[]>();

export const editCollection = (api: Wretch, collection: UpdateCollection) =>
  api.url(`/collections`).put(collection).json<Collection[]>();

export const deleteCollection = (api: Wretch, collectionId: ID) =>
  api
    .url(`/collections/${collectionId}`)
    .delete()
    .json<{ ids: ID[]; navigateHome: boolean }>();

export const markCollectionAsRead = (api: Wretch, collectionId: ID | 'home') =>
  api
    .url(`/collections/${collectionId}/markAsRead`)
    .post()
    .json<{ ids: ID[]; timestamp: number; collections: Collection[] }>();

export const refreshCollection = (api: Wretch, collectionId: ID | 'home') =>
  api.url(`/collections/${collectionId}/refresh`).post().json<{ ids: ID[] }>();

export interface MoveCollectionBody {
  collectionId: ID;
  newParentId: ID | null;
  newOrder: number;
}

export const moveCollection = (api: Wretch, body: MoveCollectionBody) =>
  api.url(`/collections/move`).post(body).json<Collection[]>();

export const setCollectionLayout = (
  api: Wretch,
  collectionId: ID | 'home',
  layout: CollectionLayout
) =>
  api
    .url(`/collections/${collectionId}/layout`)
    .put({ layout })
    .json<boolean>();

export const importOPML = (api: Wretch, file: File) =>
  api.url(`/collections/import/opml`).formData({ file }).post().json<boolean>();
