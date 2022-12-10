import React, { PropsWithChildren } from 'react';
import { Meta, Story } from '@storybook/react';
import { Button } from '@chakra-ui/react';
import { Drawer, DrawerContent, DrawerTrigger } from './Drawer';
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Components/Drawer/Drawer',
  component: Drawer,
} as Meta;

const Template: Story<PropsWithChildren> = (props) => (
  <Drawer>
    <DrawerTrigger asChild>
      <Button>trigger long name so I can see it under the overlay</Button>
    </DrawerTrigger>
    <DrawerContent>howdy there</DrawerContent>
  </Drawer>
);

export const Default = Template.bind({});
Default.args = {};
