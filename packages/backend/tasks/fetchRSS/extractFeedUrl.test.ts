import nock from 'nock';
import { extractFeedUrl, Status } from './extractFeedUrl';

const url = 'http://www.example.com';

describe('extractFeedUrl', () => {
  it('handles 404', async () => {
    nock(url).head('/').reply(404);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({ status: 'failedToFetch' });
  });

  it('handles missing content-type', async () => {
    nock(url).head('/').reply(200);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'unknownContentType',
      contentType: null,
    });
  });

  it('handles XML', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'application/xml',
      })
      .head('/')
      .reply(200);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({ status: 'isXML' });
  });

  it('handles RSS XML', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'application/rss+xml',
      })
      .head('/')
      .reply(200);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({ status: 'isXML' });
  });

  it('handles text/XML', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/xml',
      })
      .head('/')
      .reply(200);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({ status: 'isXML' });
  });

  it('handles wrong content type', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'application/json',
      })
      .head('/')
      .reply(200);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'unknownContentType',
      contentType: 'application/json',
    });
  });

  it('handles absolute feed url', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/')
      .reply(200)
      .get('/')
      .reply(
        200,
        `<html>
          <meta>
            <link rel="alternate" type="application/rss+xml" title="Fun Blog" href="${url}/feed.xml">
          </meta>
      </html>`
      );

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'OK',
      feedUrl: `${url}/feed.xml`,
    });
  });

  it('handles relative feed url', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/')
      .reply(200)
      .get('/')
      .reply(
        200,
        `<html>
          <meta>
            <link rel="alternate" type="application/rss+xml" title="Fun Blog" href="/feed.xml">
          </meta>
      </html>`
      );

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'OK',
      feedUrl: `${url}/feed.xml`,
    });
  });

  it('handles relative feed url when input url contains path', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/blog')
      .reply(200)
      .get('/blog')
      .reply(
        200,
        `<html>
          <meta>
            <link rel="alternate" type="application/rss+xml" title="Fun Blog" href="/feed.xml">
          </meta>
      </html>`
      );

    const result = await extractFeedUrl(`${url}/blog`);
    expect(result).toEqual<Status>({
      status: 'OK',
      feedUrl: `${url}/feed.xml`,
    });
  });

  it('handles atom feed url', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/')
      .reply(200)
      .get('/')
      .reply(
        200,
        `<html>
          <meta>
            <link rel="alternate" type="application/atom+xml" title="Fun Blog" href="/feed.xml">
          </meta>
      </html>`
      );

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'OK',
      feedUrl: `${url}/feed.xml`,
    });
  });

  it('handles both RSS and Atom feed urls', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/')
      .reply(200)
      .get('/')
      .reply(
        200,
        `<html>
          <meta>
            <link rel="alternate" type="application/atom+xml" title="Fun Blog" href="/atom.xml">
            <link rel="alternate" type="application/rss+xml" title="Fun Blog" href="/rss.xml">
          </meta>
      </html>`
      );

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'OK',
      feedUrl: `${url}/atom.xml`,
    });
  });

  it('handles missing feed url', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/')
      .reply(200)
      .get('/')
      .reply(
        200,
        `<html>
          <meta>
          </meta>
      </html>`
      );

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'failedToExtract',
    });
  });

  it('handles GET error', async () => {
    nock(url)
      .defaultReplyHeaders({
        'Content-Type': 'text/html',
      })
      .head('/')
      .reply(200)
      .get('/')
      .reply(500);

    const result = await extractFeedUrl(url);
    expect(result).toEqual<Status>({
      status: 'failedToFetch',
    });
  });
});
