import { z } from 'zod';
import {
  CollectionGrouping,
  CollectionLayout,
  CollectionShowFilter,
  defaultCollectionGrouping,
  defaultCollectionLayout,
  defaultCollectionShowFilter,
} from './collection';
import { ID } from './id';

export const AvatarStyle = z.enum(['fallback', 'initials']);
export type AvatarStyle = z.infer<typeof AvatarStyle>;
export const defaultAvatarStyle: AvatarStyle = 'fallback';

export const Preferences = z.object({
  expandedCollectionIds: z.array(ID),
  defaultCollectionLayout: CollectionLayout,
  homeCollectionLayout: CollectionLayout,
  avatarStyle: AvatarStyle,
  activeView: z.union([z.literal('home'), z.literal('collection')]),
  activeCollectionId: ID.nullish(),
  activeCollectionTitle: z.string(),
  activeCollectionLayout: CollectionLayout,
  activeCollectionFilter: CollectionShowFilter,
  activeCollectionGrouping: CollectionGrouping,
});

export type Preferences = z.infer<typeof Preferences>;

export const ViewPreferences = Preferences.pick({
  activeView: true,
  activeCollectionId: true,
});
export type ViewPreferences = z.infer<typeof ViewPreferences>;

export const defaultPreferences: Preferences = {
  activeView: 'home',
  activeCollectionTitle: 'Home',
  activeCollectionLayout: defaultCollectionLayout,
  activeCollectionFilter: defaultCollectionShowFilter,
  activeCollectionGrouping: defaultCollectionGrouping,
  defaultCollectionLayout,
  homeCollectionLayout: defaultCollectionLayout,
  expandedCollectionIds: [],
  avatarStyle: defaultAvatarStyle,
};
