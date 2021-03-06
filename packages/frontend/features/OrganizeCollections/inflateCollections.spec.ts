import { FlatCollection } from '@orpington-news/shared';
import { inflateCollections } from './inflateCollections';

describe('inflateCollections', () => {
  it('works for empty array', () => {
    expect(inflateCollections([])).toEqual([]);
  });

  it('works', () => {
    const data: FlatCollection[] = [
      {
        id: 1,
        title: 'Feed 01',
        icon: 'React',
        order: 0,
        url: 'https://feed-01.com/rss.xml',
        dateUpdated: 1641058737938,
        parents: [],
        level: 0,
        unreadCount: 32,
        refreshInterval: 60,
      },
      {
        id: 2,
        title: 'Feed 02',
        icon: 'Linux',
        order: 1,
        url: 'https://feed-02.com/rss.xml',
        dateUpdated: 1641058764932,
        parents: [],
        level: 0,
        unreadCount: 10,
        refreshInterval: 60,
      },
      {
        id: 3,
        title: 'Collection 03',
        icon: 'Haskell',
        order: 2,
        dateUpdated: 1641058850881,
        parents: [],
        level: 0,
        unreadCount: 0,
        refreshInterval: 60,
      },
      {
        id: 5,
        title: 'Feed 03-02',
        icon: 'Haskell',
        order: 1,
        url: 'https://feed-03-02.com/rss.xml',
        dateUpdated: 1641058961198,
        parents: [3],
        level: 1,
        unreadCount: 15,
        refreshInterval: 60,
      },
      {
        id: 4,
        title: 'Collection 03-01',
        icon: 'Haskell',
        order: 0,
        dateUpdated: 1641058920330,
        parents: [3],
        level: 1,
        unreadCount: 0,
        refreshInterval: 60,
      },
      {
        id: 6,
        title: 'Feed 03-01-01',
        icon: 'Haskell',
        order: 0,
        url: 'https://feed-03-01-01.com/rss.xml',
        dateUpdated: 1641059005051,
        parents: [3, 4],
        level: 2,
        unreadCount: 11,
        refreshInterval: 60,
      },
    ];

    expect(inflateCollections(data)).toEqual([
      {
        id: 1,
        title: 'Feed 01',
        icon: 'React',
        url: 'https://feed-01.com/rss.xml',
        dateUpdated: 1641058737938,
        unreadCount: 32,
        children: undefined,
        refreshInterval: 60,
      },
      {
        id: 2,
        title: 'Feed 02',
        icon: 'Linux',
        url: 'https://feed-02.com/rss.xml',
        dateUpdated: 1641058764932,
        unreadCount: 10,
        children: undefined,
        refreshInterval: 60,
      },
      {
        id: 3,
        title: 'Collection 03',
        icon: 'Haskell',
        dateUpdated: 1641058850881,
        unreadCount: 26,
        refreshInterval: 60,
        children: [
          {
            id: 4,
            title: 'Collection 03-01',
            icon: 'Haskell',
            dateUpdated: 1641058920330,
            unreadCount: 11,
            parentId: 3,
            refreshInterval: 60,
            children: [
              {
                id: 6,
                title: 'Feed 03-01-01',
                icon: 'Haskell',
                url: 'https://feed-03-01-01.com/rss.xml',
                dateUpdated: 1641059005051,
                unreadCount: 11,
                parentId: 4,
                children: undefined,
                refreshInterval: 60,
              },
            ],
          },
          {
            id: 5,
            title: 'Feed 03-02',
            icon: 'Haskell',
            url: 'https://feed-03-02.com/rss.xml',
            dateUpdated: 1641058961198,
            unreadCount: 15,
            parentId: 3,
            children: undefined,
            refreshInterval: 60,
          },
        ],
      },
    ]);
  });
});
