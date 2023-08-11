import { Meta, Story } from '@storybook/react';
import { ArticleSkeleton } from './ArticleSkeleton';

export default {
  title: 'Components/Article/ArticleSkeleton',
  component: ArticleSkeleton,
} as Meta;

const Template: Story = (props) => <ArticleSkeleton {...props} />;

export const Default = Template.bind({});
Default.args = {};

export const Mobile = Template.bind({});
Mobile.args = {};
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};
