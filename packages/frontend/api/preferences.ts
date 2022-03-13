import { Wretcher } from 'wretch';
import type { ID, Preferences, ViewPreference } from '@orpington-news/shared';

export const getPreferences = (api: Wretcher) =>
  api.url(`/preferences`).get().json<Preferences>();

export const expandCollection = (api: Wretcher, collectionId: ID) =>
  api.url(`/preferences/expand/${collectionId}`).put().json<Preferences>();

export const collapseCollection = (api: Wretcher, collectionId: ID) =>
  api.url(`/preferences/collapse/${collectionId}`).put().json<Preferences>();

export const setActiveView = (api: Wretcher, activeView: ViewPreference) =>
  api.url(`/preferences/activeView`).put(activeView).json<Preferences>();
