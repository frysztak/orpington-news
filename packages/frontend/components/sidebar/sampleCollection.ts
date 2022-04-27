import { Collection, defaultIcon } from '@orpington-news/shared';

export const sampleCollections: Collection[] = [
  {
    id: 1,
    title: 'Feed 01',
    unreadCount: 9,
    icon: 'React',
  },
  {
    id: 2,
    title: 'Feed 02',
    unreadCount: 10,
    icon: 'TypeScript',
    children: [],
  },
  {
    id: 3,
    title: 'A Little Bit Longer Category 01',
    unreadCount: 11,
    icon: defaultIcon,
    children: [
      {
        id: 301,
        title: 'Feed 03-01',
        unreadCount: 112,
        icon: defaultIcon,
      },
      {
        id: 302,
        title: 'Category 02',
        unreadCount: 113,
        icon: defaultIcon,
        children: [
          {
            id: 30201,
            title: 'Feed 03-02-01',
            unreadCount: 114,
            icon: defaultIcon,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Feed 04',
    unreadCount: 9,
    icon: defaultIcon,
  },
];
