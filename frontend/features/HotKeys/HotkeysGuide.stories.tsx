import React from 'react';
import { Meta, Story } from '@storybook/react';
import { HotkeysGuide, HotkeysGuideProps } from './HotkeysGuide';

export default {
  title: 'Components/Hotkeys/HotkeysGuide',
  component: HotkeysGuide,
} as Meta;

const Template: Story<HotkeysGuideProps> = (props) => (
  <HotkeysGuide {...props} />
);

export const Default = Template.bind({});
Default.args = {};
