import React from 'react';
import { Meta, Story } from '@storybook/react';
import { Avatar, AvatarProps } from './Avatar';

export default {
  title: 'Components/Sidebar/Avatar',
  component: Avatar,
} as Meta;

const Template: Story<AvatarProps> = (props) => <Avatar {...props} />;

export const StyleInitials = Template.bind({});
StyleInitials.args = {
  name: 'John Smith',
  avatarStyle: 'initials',
};

export const StyleFallback = Template.bind({});
StyleFallback.args = {
  ...StyleInitials.args,
  avatarStyle: 'fallback',
};

export const Image = Template.bind({});
Image.args = {
  ...StyleInitials.args,
  src: 'https://bit.ly/dan-abramov',
};

export const UploadBadge = Template.bind({});
UploadBadge.args = {
  ...StyleInitials.args,
  badge: 'upload',
};

export const DeleteBadge = Template.bind({});
DeleteBadge.args = {
  ...StyleInitials.args,
  badge: 'delete',
};
