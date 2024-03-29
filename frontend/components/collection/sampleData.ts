import { faker } from '@faker-js/faker';
import { getUnixTime } from 'date-fns';
import {
  Collection,
  CollectionItem,
  defaultIcon,
  defaultRefreshInterval,
} from '@shared';

export const generateSampleCollectionItem = (
  collection: Collection
): CollectionItem => {
  const title = faker.hacker.phrase();

  return {
    id: faker.number.int(),
    url: faker.internet.url(),
    summary: faker.lorem.words(30),
    datePublished: getUnixTime(faker.date.recent()),
    dateUpdated: getUnixTime(faker.date.recent()),
    title,
    fullText: `<b>${title}</b><br/>${faker.lorem.sentences(10)}`,

    collection,
    readingTime: faker.datatype.float({ min: 0.1, max: 25, precision: 3 }),
    onReadingList: faker.datatype.boolean(),
  };
};

export const generateSampleCollection = (name?: string): Collection => {
  const n = name || faker.company.name();
  return {
    id: faker.datatype.number(),
    title: n,
    icon: defaultIcon,
    unreadCount: faker.datatype.number(),
    refreshInterval: defaultRefreshInterval,
  } as Collection;
};

export const sampleCollections: Collection[] = [
  {
    id: 1,
    title: 'Feed 01',
    unreadCount: 9,
    icon: 'React',
    parents: [],
    children: [],
    level: 0,
    order: 0,
    orderPath: [0],
    isLastChild: false,
    isHome: false,
  },
  {
    id: 2,
    title: 'Feed 02',
    unreadCount: 10,
    icon: 'TypeScript',
    parents: [],
    children: [],
    level: 0,
    order: 1,
    orderPath: [1],
    isLastChild: false,
    isHome: false,
  },
  {
    id: 3,
    title: 'A Little Bit Longer Category 01',
    unreadCount: 11,
    icon: defaultIcon,
    parents: [],
    children: [301, 302, 30201],
    level: 0,
    order: 2,
    orderPath: [2],
    isLastChild: false,
    isHome: false,
  },
  {
    id: 301,
    title: 'Feed 03-01',
    unreadCount: 112,
    icon: defaultIcon,
    parents: [3],
    parentId: 3,
    parentOrder: 2,
    children: [],
    level: 1,
    order: 0,
    orderPath: [2, 0],
    isLastChild: false,
    isHome: false,
  },
  {
    id: 302,
    title: 'Category 02',
    unreadCount: 113,
    icon: defaultIcon,
    parents: [3],
    children: [30201],
    level: 1,
    order: 1,
    orderPath: [2, 1],
    isLastChild: true,
    isHome: false,
  },
  {
    id: 30201,
    title: 'Feed 03-02-01',
    unreadCount: 114,
    icon: defaultIcon,
    parents: [3, 302],
    children: [],
    level: 2,
    order: 0,
    orderPath: [2, 1, 0],
    isLastChild: true,
    isHome: false,
  },
  {
    id: 4,
    title: 'Feed 04',
    unreadCount: 9,
    icon: defaultIcon,
    parents: [],
    children: [],
    level: 0,
    order: 3,
    orderPath: [3],
    isLastChild: false,
    isHome: false,
  },
];
