import React, { PropsWithChildren } from 'react';
import { Meta, Story } from '@storybook/react';
import { Button } from '@chakra-ui/react';
import { CgRemove } from '@react-icons/all-files/cg/CgRemove';
import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger } from './Menu';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Menu/Menu',
  component: Menu,
} as Meta;

const Template: Story<PropsWithChildren> = (props) => (
  <Menu>
    <MenuTrigger asChild>
      <Button>trigger</Button>
    </MenuTrigger>
    <MenuContent>
      <MenuItem onSelect={action('item 1')}>item 1</MenuItem>
      <MenuDivider />
      <MenuItem onSelect={action('item 2')} icon={<CgRemove />}>
        item 2
      </MenuItem>
    </MenuContent>
  </Menu>
);

export const Default = Template.bind({});
Default.args = {};
