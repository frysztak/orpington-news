import fetch from 'node-fetch';
import { load } from 'cheerio';
import urlJoin from 'proper-url-join';
import isRelativeUrl from 'is-relative-url';

export type Status =
  | { status: 'OK'; feedUrl: string }
  | { status: 'isXML' }
  | { status: 'unknownContentType'; contentType: string | null }
  | { status: 'failedToFetch' }
  | { status: 'failedToExtract' };

export const extractFeedUrl = async (inputUrl: string): Promise<Status> => {
  const headResponse = await fetch(inputUrl, {
    method: 'HEAD',
  });

  if (!headResponse.ok) {
    return { status: 'failedToFetch' };
  }

  const contentType = headResponse.headers.get('content-type');
  if (!contentType) {
    return { status: 'unknownContentType', contentType };
  }

  if (
    contentType.includes('application/atom+xml') ||
    contentType.includes('application/rss+xml') ||
    contentType.includes('application/xml')
  ) {
    return { status: 'isXML' };
  }

  if (!contentType.includes('text/html')) {
    return { status: 'unknownContentType', contentType };
  }

  const getResponse = await fetch(inputUrl, {
    method: 'GET',
  });
  if (!getResponse.ok) {
    return { status: 'failedToFetch' };
  }

  const $ = load(await getResponse.text());
  const rssLinkEl = $(
    'html head link[type="application/rss+xml"], html head link[type="application/atom+xml"]'
  );
  const rssLink = rssLinkEl.attr('href');
  if (rssLink) {
    const feedUrl = isRelativeUrl(rssLink)
      ? urlJoin(inputUrl, rssLink)
      : rssLink;
    return { status: 'OK', feedUrl };
  }

  return { status: 'failedToExtract' };
};
