import { Meta, Story } from '@storybook/react';
import { CollectionsSkeleton } from './CollectionsSkeleton';

export default {
  title: 'Components/Sidebar/CollectionsSkeleton',
  component: CollectionsSkeleton,
} as Meta;

const Template: Story = (props) => <CollectionsSkeleton {...props} />;

export const Default = Template.bind({});
Default.args = {};
