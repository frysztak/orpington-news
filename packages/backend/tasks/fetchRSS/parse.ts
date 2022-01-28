import Parser from 'rss-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Static, Type } from '@sinclair/typebox';
import truncate from 'truncate-html';
import readingTime from 'reading-time';
import striptags from 'striptags';
import { decode } from 'html-entities';
import DOMPurify from 'isomorphic-dompurify';
import { getUnixTime, parseISO } from 'date-fns';
import { URL } from 'url';
import { slugify } from '@utils';
import { DBCollectionItem } from '@db/collectionItems';
import { logger } from '@utils/logger';
import { notEmpty } from '@orpington-news/shared';
import { cleanHTML } from './htmlCleaner';

export const parser = new Parser({
  customFields: {
    feed: ['subtitle'],
    item: [
      ['media:thumbnail', 'thumbnail'],
      ['category', 'category', { keepArray: true }],
      ['id'],
      ['comments'],
    ],
  },
});

const FeedItem = Type.Object({
  id: Type.Optional(Type.String()),
  guid: Type.Optional(Type.String()),
  title: Type.String(),
  link: Type.String(),
  content: Type.String(),
  isoDate: Type.String({ format: 'date-time' }),
  summary: Type.Optional(Type.String()),
  thumbnail: Type.Optional(Type.Any()),
  comments: Type.Optional(Type.Any()),
  category: Type.Optional(Type.Any()),
});
export type FeedItemType = Static<typeof FeedItem>;

const ajv = addFormats(new Ajv({}), ['date-time'])
  .addKeyword('kind')
  .addKeyword('modifier');
const validateFeedItem = ajv.compile<FeedItemType>(FeedItem);

export const fetchFeed = async (feedUrl: string) => {
  return parser.parseURL(feedUrl);
};

export const mapFeedItems = (
  feedItems: Array<any>
): Array<
  Omit<
    DBCollectionItem,
    | 'serial_id'
    | 'date_updated'
    | 'date_read'
    | 'collection_id'
    | 'collection_title'
    | 'collection_slug'
    | 'collection_icon'
  >
> => {
  return feedItems
    .flatMap((item) => {
      const valid = validateFeedItem(item);
      if (!valid) {
        logger.error(
          `Feed item '${
            (item as any)?.link || 'UNKNOWN LINK'
          }' doesn't adhere to schema: ${validateFeedItem.errors}`
        );
        return null;
      }

      if (!item.guid && !item.id) {
        logger.error(`Feed item '${item.link}' doesn't have ID`);
        return null;
      }

      if (!item.content) {
        logger.error(`Feed item '${item.link}' doesn't have content`);
        return null;
      }

      const title = decode(item.title).trim();
      const rootUrl = new URL(item.link).origin;
      const content = cleanHTML(
        ((<any>item)['content:encoded'] || item.content).trim(),
        rootUrl
      );
      const pureText = striptags(content);

      const stats = readingTime(pureText);

      return {
        id: (item.guid || item.id) as string,
        title: title,
        slug: slugify(title),
        link: item.link,
        full_text: DOMPurify.sanitize(content),
        summary: decode(
          item.summary?.trim() || truncate(pureText, 20, { byWords: true })
        ),
        thumbnail_url: extractThumbnailUrl(item),
        date_published: getUnixTime(parseISO(item.isoDate)),
        categories: extractCategories(item),
        comments: item.comments || null,
        reading_time: stats.minutes,
      };
    })
    .filter(notEmpty);
};

const extractThumbnailUrl = (feedItem: FeedItemType): string | null => {
  return feedItem.thumbnail?.['$']?.url || null;
};

const extractCategories = (feedItem: FeedItemType): string[] | null => {
  return (
    feedItem.category?.map((obj: any) => obj?.['$']?.term)?.filter(notEmpty) ||
    null
  );
};
