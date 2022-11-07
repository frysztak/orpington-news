import { z } from 'zod';
import {
  CollectionGrouping,
  CollectionLayout,
  CollectionFilter,
  defaultCollectionGrouping,
  defaultCollectionLayout,
  defaultCollectionFilter,
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
});

export type Preferences = z.infer<typeof Preferences>;

export const ViewPreferences = Preferences.pick({
  activeCollectionId: true,
});
export type ViewPreferences = z.infer<typeof ViewPreferences>;

export const defaultPreferences: Preferences = {
  activeCollectionTitle: 'Home',
  activeCollectionLayout: defaultCollectionLayout,
  activeCollectionFilter: defaultCollectionFilter,
  activeCollectionGrouping: defaultCollectionGrouping,
  activeCollectionId: 0,
  defaultCollectionLayout,
  expandedCollectionIds: [],
  avatarStyle: defaultAvatarStyle,
};
