import { mapFeedItems, parser } from './parse';

describe('RSS parser', () => {
  it('works for Atom feed with thumbnail url and categories', async () => {
    const feed = await parser.parseString(`
    <?xml version="1.0" encoding="utf-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <generator uri="https://jekyllrb.com/" version="3.9.0">Jekyll</generator>
      <link href="https://example.com/feed.xml" rel="self" type="application/atom+xml" />
      <link href="https://example.com/" rel="alternate" type="text/html" />
      <updated>2022-01-01T23:26:44+00:00</updated>
      <id>https://example.com/feed.xml</id>
      <title type="html">Example Blog</title>
      <subtitle>A blog that happens to be an example</subtitle>
      <entry>
        <title type="html">My fun blog post, please enjoy</title>
        <link href="https://example.com/2021/10/09/post-02/" rel="alternate" type="text/html" title="My fun blog post, please enjoy" />
        <published>2021-10-09T12:15:00+00:00</published>
        <updated>2021-10-09T12:15:00+00:00</updated>
        <id>https://example.com/2021/10/09/post-02</id>
        <content type="html" xml:base="https://example.com/2021/10/09/post-02/">content</content>
        <author>
          <name></name>
        </author>
        <category term="Category 01" />
        <category term="Category 02" />
        <summary type="html">Fun awaits.</summary>
        <media:thumbnail xmlns:media="http://search.yahoo.com/mrss/" url="https://example.com/assets/image.jpg" />
        <media:content medium="image" url="https://example.com/assets/image.jpg" xmlns:media="http://search.yahoo.com/mrss/" />
      </entry>
    </feed>`);

    expect(mapFeedItems(feed.items)).toEqual([
      {
        id: 'https://example.com/2021/10/09/post-02',
        title: 'My fun blog post, please enjoy',
        slug: 'my-fun-blog-post-please-enjoy',
        link: 'https://example.com/2021/10/09/post-02/',
        date_published: 1633781700,
        full_text: 'content',
        reading_time: 0.005,
        summary: 'Fun awaits.',
        thumbnail_url: 'https://example.com/assets/image.jpg',
        categories: ['Category 01', 'Category 02'],
        comments: null,
      },
    ]);
  });

  it('works for RSS 2.0 feed with comments', async () => {
    const feed = await parser.parseString(`
    <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Hacker News: Front Page</title>
        <link>https://news.ycombinator.com/</link>
        <description>Hacker News RSS</description>
        <docs>https://hnrss.org/</docs>
        <generator>hnrss v1.1-16-gb4aa33c</generator>
        <lastBuildDate>Sat, 08 Jan 2022 15:47:26 +0000</lastBuildDate>
        <atom:link href="https://hnrss.org/frontpage" rel="self" type="application/rss+xml"></atom:link>
        <item>
            <title>
                <![CDATA[Why do 70% of families lose their wealth in the 2nd generation? (2018)]]>
            </title>
            <description>
                <![CDATA[
<p>Article URL: <a href="https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10">https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10</a></p>
<p>Comments URL: <a href="https://news.ycombinator.com/item?id=29852270">https://news.ycombinator.com/item?id=29852270</a></p>
<p>Points: 50</p>
<p># Comments: 43</p>
]]>
            </description>
            <pubDate>Sat, 08 Jan 2022 15:03:39 +0000</pubDate>
            <link>https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10</link>
            <dc:creator>ushakov</dc:creator>
            <comments>https://news.ycombinator.com/item?id=29852270</comments>
            <guid isPermaLink="false">https://news.ycombinator.com/item?id=29852270</guid>
        </item>
    </channel>
</rss>`);

    expect(mapFeedItems(feed.items)).toEqual([
      {
        id: 'https://news.ycombinator.com/item?id=29852270',
        title:
          'Why do 70% of families lose their wealth in the 2nd generation? (2018)',
        slug: 'why-do-70percent-of-families-lose-their-wealth-in-the-2nd-generation-(2018)',
        link: 'https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10',
        date_published: 1641654219,
        full_text: `<p>Article URL: <a href=\"https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10\">https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10</a></p>
<p>Comments URL: <a href=\"https://news.ycombinator.com/item?id=29852270\">https://news.ycombinator.com/item?id=29852270</a></p>
<p>Points: 50</p>
<p># Comments: 43</p>`,
        reading_time: 0.055,
        summary:
          'Article URL: https://www.nasdaq.com/articles/generational-wealth%3A-why-do-70-of-families-lose-their-wealth-in-the-2nd-generation-2018-10 Comments URL: https://news.ycombinator.com/item?id=29852270 Points: 50 # Comments: 43',
        thumbnail_url: null,
        categories: null,
        comments: 'https://news.ycombinator.com/item?id=29852270',
      },
    ]);
  });
});
