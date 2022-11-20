import { z } from 'zod';
import {
  CollectionGrouping,
  CollectionLayout,
  CollectionFilter,
  defaultCollectionGrouping,
  defaultCollectionLayout,
  defaultCollectionFilter,
  CollectionSortBy,
  defaultCollectionSortBy,
} from './collection';
import { ID } from './id';

export const AvatarStyle = z.enum(['fallback', 'initials']);
export type AvatarStyle = z.infer<typeof AvatarStyle>;
export const defaultAvatarStyle: AvatarStyle = 'fallback';

export const Preferences = z.object({
  expandedCollectionIds: z.array(ID),
  defaultCollectionLayout: CollectionLayout,
  avatarStyle: AvatarStyle,
  activeCollectionId: ID,
  activeCollectionTitle: z.string(),
  activeCollectionLayout: CollectionLayout,
  activeCollectionFilter: CollectionFilter,
  activeCollectionGrouping: CollectionGrouping,
  activeCollectionSortBy: CollectionSortBy,
});

export type Preferences = z.infer<typeof Preferences>;

export const SetActiveCollectionData = Preferences.pick({
  activeCollectionId: true,
  activeCollectionTitle: true,
  activeCollectionLayout: true,
  activeCollectionFilter: true,
  activeCollectionGrouping: true,
  activeCollectionSortBy: true,
});
export type SetActiveCollectionData = z.infer<typeof SetActiveCollectionData>;

export const defaultPreferences: Preferences = {
  activeCollectionTitle: 'Home',
  activeCollectionLayout: defaultCollectionLayout,
  activeCollectionFilter: defaultCollectionFilter,
  activeCollectionGrouping: defaultCollectionGrouping,
  activeCollectionSortBy: defaultCollectionSortBy,
  activeCollectionId: 0,
  defaultCollectionLayout,
  expandedCollectionIds: [],
  avatarStyle: defaultAvatarStyle,
};
