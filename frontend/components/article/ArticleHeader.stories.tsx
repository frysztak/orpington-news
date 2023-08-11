import React from 'react';
import { Meta, Story } from '@storybook/react';
import { ArticleHeader, ArticleHeaderProps } from './ArticleHeader';

export default {
  title: 'Components/Article/ArticleHeader',
  component: ArticleHeader,
} as Meta;

const Template: Story<ArticleHeaderProps> = (props) => (
  <ArticleHeader {...props} />
);

const article = {
  id: 'id0',
  title: 'Fun Article',
  datePublished: 1633781700,
  readingTime: 14.5,
  collection: {
    title: 'Fun One',
  },
} as any;

export const Default = Template.bind({});
Default.args = {
  article,
};

export const Mobile = Template.bind({});
Mobile.args = {
  ...Default.args,
};
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};

export const ForceMobile = Template.bind({});
ForceMobile.args = {
  ...Default.args,
  mobileLayout: true,
};

export const LongNameInline = Template.bind({});
LongNameInline.args = {
  ...Default.args,
  article: {
    ...article,
    title:
      'Johann Gambolputty de von Ausfern-schplenden-schlitter-crasscrenbon-fried-digger-dingle-dangle-dongle-dungle-burstein-von-knacker-thrasher-apple-banger-horowitz-ticolensic-grander-knotty-spelltinkle-grandlich-grumblemeyer-spelterwasser-kurstlich-himbleeisen-bahnwagen-gutenabend-bitte-ein-nürnburger-bratwustle-gerspurten-mitzweimache-luber-hundsfut-gumberaber-shönendanker-kalbsfleisch-mittler-aucher von Hautkopft of Ulm',
  },
};

export const LongName = Template.bind({});
LongName.args = {
  ...Default.args,
  article: {
    ...article,
    title: 'Very Long Fun Article',
  },
};
LongName.parameters = {
  ...Mobile.parameters,
};

export const LongWord = Template.bind({});
LongWord.args = {
  ...Default.args,
  article: {
    ...article,
    title: 'killbutmakeitlooklikeanaccident.sh',
  },
};
LongWord.parameters = {
  ...Mobile.parameters,
};

export const LongCollection = Template.bind({});
LongCollection.args = {
  ...Default.args,
  article: {
    ...article,
    collection: {
      ...article.collection,
      title: 'killbutmakeitlooklikeanaccident.sh',
    },
  },
};
LongCollection.parameters = {
  ...Mobile.parameters,
};
