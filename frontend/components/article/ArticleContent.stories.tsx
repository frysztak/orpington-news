import React from 'react';
import { Meta, Story } from '@storybook/react';
import { ArticleContent, ArticleContentProps } from './ArticleContent';

export default {
  title: 'Components/Article/ArticleContent',
  component: ArticleContent,
} as Meta;

const Template: Story<ArticleContentProps> = (props) => (
  <div className="w-[50vw]">
    <ArticleContent {...props} />
  </div>
);

export const NoContent = Template.bind({});
NoContent.args = {
  html: '',
};

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

export const CodeBlockSyntaxHighlight = Template.bind({});
CodeBlockSyntaxHighlight.args = {
  html: `<pre class="language-jsx"><code class="language-jsx"><span class="token keyword">import</span> <span class="token punctuation">{</span> useState <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">'react'</span><span class="token punctuation">;</span></code></pre>`,
};

export const CodeBlockSyntaxHighlightLongLine = Template.bind({});
CodeBlockSyntaxHighlightLongLine.args = {
  html: `<pre class="language-jsx"><code class="language-jsx"><span class="token keyword">let</span> Rectangle <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token function">resizeTopLeft</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeTopRight</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeBottomLeft</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeBottomRight</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">let</span> Oval <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token function">resizeLeft</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeRight</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeTop</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeBottom</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>

<span class="token keyword">let</span> Header <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token function">resizeLeft</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeRight</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>  
<span class="token punctuation">}</span>

<span class="token keyword">let</span> TextBlock <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token function">resizeTopLeft</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeTopRight</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeBottomLeft</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token function">resizeBottomRight</span><span class="token punctuation">(</span><span class="token parameter">position<span class="token punctuation">,</span> size<span class="token punctuation">,</span> preserveAspect<span class="token punctuation">,</span> dx<span class="token punctuation">,</span> dy</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token comment">// 10 repetitive lines of math</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span></code></pre>`,
};
CodeBlockSyntaxHighlightLongLine.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};

export const HeadingWithSvg = Template.bind({});
HeadingWithSvg.args = {
  html: `
  <h2 id="an-artificially-slow-component">
    <a href="#an-artificially-slow-component" aria-hidden="" class="anchor">
      <svg aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16">
        <path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path>
      </svg>
    </a>An (Artificially) Slow Component
  </h2>`,
};
