import type { CollectionItem } from '@orpington-news/shared';

export const articlePreviewData: CollectionItem = {
  summary: '',
  title: 'Structures from Silence',
  id: 0,
  url: '#',
  previousId: null,
  nextId: null,
  fullText: `
    <p><i><b>Structures from Silence</i></b> is the third studio album by American ambient musician Steve Roach. It was released in 1984 on Fortuna.</p>
    <h3>Sample code:</h3>
    <pre class="language-js"><code>function factorial(num: number): number {
  return num === 0
    ? 1
    : num * factorial(num - 1);
}</code></pre>
    <p>Here's some inline code as well: <code>const x: string = "Hello";</code></p>
`,
  datePublished: 458697600,
  dateUpdated: 458697600,
  onReadingList: false,
  collection: {
    id: 1,
    icon: 'Haskell',
    title: "Steve Roach's Ambient Blog",
  },
  readingTime: 17,
};
