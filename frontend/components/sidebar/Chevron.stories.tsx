import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Chevron, ChevronProps } from './Chevron';

export default {
  title: 'Components/Sidebar/Chevron',
  component: Chevron,
} as Meta;

const Template: Story<ChevronProps> = (props) => <Chevron {...props} />;

export const Top = Template.bind({});
Top.args = {
  pointTo: 'top',
};
export const Bottom = Template.bind({});
Bottom.args = {
  pointTo: 'bottom',
};
