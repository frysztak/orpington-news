import { Meta, Story } from '@storybook/react';
import { ArticleHeader, ArticleHeaderProps } from './ArticleHeader';

export default {
  title: 'Components/Article/ArticleHeader',
  component: ArticleHeader,
} as Meta;

const Template: Story<ArticleHeaderProps> = (props) => (
  <ArticleHeader {...props} />
);

export const Default = Template.bind({});
Default.args = {
  article: {
    id: 'id0',
    title: 'Fun Article',
    datePublished: 1633781700,
    readingTime: 14.5,
  } as any,
};
