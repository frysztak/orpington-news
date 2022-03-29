import faker from '@faker-js/faker';
import slugify from 'slugify';
import { getUnixTime } from 'date-fns';
import {
  Collection,
  CollectionItem,
  defaultIcon,
  defaultRefreshInterval,
} from '@orpington-news/shared';

export const generateSampleCollectionItem = (
  collection: Collection
): CollectionItem => {
  const title = faker.hacker.phrase();

  return {
    id: faker.datatype.uuid(),
    serialId: faker.datatype.number(),
    link: faker.internet.url(),
    summary: faker.lorem.words(30),
    datePublished: getUnixTime(faker.date.recent()),
    dateUpdated: getUnixTime(faker.date.recent()),
    title,
    slug: slugify(title),
    fullText: `<b>${title}</b><br/>${faker.lorem.sentences(10)}`,

    collection,
    readingTime: faker.datatype.float({ min: 0.1, max: 25, precision: 3 }),
    onReadingList: faker.datatype.boolean(),
  };
};

export const generateSampleCollection = (name?: string): Collection => {
  const n = name || faker.company.companyName();
  return {
    id: faker.datatype.number(),
    title: n,
    icon: defaultIcon,
    slug: slugify(n),
    unreadCount: faker.datatype.number(),
    refreshInterval: defaultRefreshInterval,
  };
};
