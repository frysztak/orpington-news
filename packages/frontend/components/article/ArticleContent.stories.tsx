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

export const CodeBlockGatsby = Template.bind({});
CodeBlockGatsby.args = {
  html: `<pre class="language-jsx">
  <code class="language-jsx">
  <span class="token keyword">import</span> <span class="token punctuation">{</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span>

  </code></pre>`,
};
