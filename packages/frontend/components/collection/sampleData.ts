import faker from 'faker';
import slugify from 'slugify';
import { Collection, CollectionItem } from '@orpington-news/shared';

export const generateSampleCollectionItem = (
  collection: Collection
): CollectionItem => {
  const title = faker.hacker.phrase();

  return {
    id: faker.datatype.number(),
    url: faker.internet.url(),
    summary: faker.lorem.words(30),
    datePublished: faker.date.recent(),
    title,
    slug: slugify(title),
    fullText: `<b>${title}</b><br/>${faker.lorem.sentences(10)}`,

    collection,
    readingTime: faker.datatype.number(25),
    onReadingList: faker.datatype.boolean(),
  };
};

export const generateSampleCollection = (name?: string): Collection => {
  const n = name || faker.company.companyName();
  return {
    id: faker.datatype.number(),
    name: n,
    slug: slugify(n),
    unreadCount: faker.datatype.number(),
  };
};
