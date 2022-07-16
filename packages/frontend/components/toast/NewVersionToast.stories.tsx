import React from 'react';
import { Meta, Story } from '@storybook/react';
import { NewVersionToast, NewVersionToastProps } from './NewVersionToast';

export default {
  title: 'Components/Toast/NewVersion',
  component: NewVersionToast,
} as Meta;

const Template: Story<NewVersionToastProps> = (props) => (
  <NewVersionToast {...props} />
);

export const Default = Template.bind({});
Default.args = {
  id: 1,
};
