import type { Wretch } from '@api';
import type { ID, Preferences, SetActiveCollectionData } from '@shared';

export const getPreferences = (api: Wretch, signal: AbortSignal | undefined) =>
  api.options({ signal }).url(`/preferences`).get().json<Preferences>();

export type SaveablePreferences = Pick<Preferences, 'defaultCollectionLayout'>;
export const savePreferences = (
  api: Wretch,
  preferences: SaveablePreferences
) => api.url(`/preferences`).put(preferences).json<Preferences>();

export const expandCollection = (api: Wretch, collectionId: ID) =>
  api.url(`/preferences/expand/${collectionId}`).put().json<Preferences>();

export const collapseCollection = (api: Wretch, collectionId: ID) =>
  api.url(`/preferences/collapse/${collectionId}`).put().json<Preferences>();

export const setActiveView = (
  api: Wretch,
  activeCollectionData: SetActiveCollectionData
) =>
  api
    .url(`/preferences/activeView`)
    .put(activeCollectionData)
    .json<Preferences>();
