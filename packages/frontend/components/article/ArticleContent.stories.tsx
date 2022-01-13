import { Meta, Story } from '@storybook/react';
import { ArticleContent, ArticleContentProps } from './ArticleContent';

export default {
  title: 'Components/Article/ArticleContent',
  component: ArticleContent,
} as Meta;

const Template: Story<ArticleContentProps> = (props) => (
  <ArticleContent {...props} />
);

export const Paragraph = Template.bind({});
Paragraph.args = {
  html: `<p>Test paragraph</p>`,
};

export const InlineCode = Template.bind({});
InlineCode.args = {
  html: `<code>yarn add</code>`,
};

export const CodeBlock = Template.bind({});
CodeBlock.args = {
  html: `<pre><code>yarn add</code></pre>`,
};
