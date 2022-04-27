import { defaultIcon, FlatCollection } from '@orpington-news/shared';

export const flatSampleCollections: FlatCollection[] = [
  {
    id: 1,
    title: 'Feed 01',
    unreadCount: 9,
    icon: 'React',
    parents: [],
    order: 0,
    level: 0,
  },
  {
    id: 2,
    title: 'Feed 02',
    unreadCount: 10,
    icon: 'TypeScript',
    parents: [],
    order: 1,
    level: 0,
  },
  {
    id: 3,
    title: 'A Little Bit Longer Category 01',
    unreadCount: 11,
    icon: defaultIcon,
    parents: [],
    order: 2,
    level: 0,
  },
  {
    id: 301,
    title: 'Feed 03-01',
    unreadCount: 112,
    icon: defaultIcon,
    parents: [3],
    order: 0,
    level: 1,
  },
  {
    id: 302,
    title: 'Category 02',
    unreadCount: 113,
    icon: defaultIcon,
    parents: [3],
    order: 1,
    level: 1,
  },
  {
    id: 30201,
    title: 'Feed 03-02-01',
    unreadCount: 114,
    icon: defaultIcon,
    parents: [3, 302],
    order: 0,
    level: 2,
  },
  {
    id: 4,
    title: 'Feed 04',
    unreadCount: 9,
    icon: defaultIcon,
    parents: [],
    order: 3,
    level: 0,
  },
];
