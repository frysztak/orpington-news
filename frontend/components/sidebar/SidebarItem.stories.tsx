import React from 'react';
import { Meta, Story } from '@storybook/react';
import { AiOutlineHome } from 'react-icons/ai';
import { action } from '@storybook/addon-actions';
import { SidebarItem, SidebarItemProps } from './SidebarItem';

export default {
  title: 'Components/Sidebar/SidebarItem',
  component: SidebarItem,
} as Meta;

const Template: Story<SidebarItemProps> = (props) => <SidebarItem {...props} />;

export const Default = Template.bind({});
Default.args = {
  icon: AiOutlineHome,
  title: 'Home',
  onClick: action('onClick'),
  onChevronClick: action('onChevronClick'),
  onMenuActionClicked: action('onMenuActionClicked'),
};
export const Active = Template.bind({});
Active.args = {
  ...Default.args,
  isActive: true,
};

export const WithoutIcon = Template.bind({});
WithoutIcon.args = {
  ...Default.args,
  icon: undefined,
};

export const WithChevron = Template.bind({});
WithChevron.args = {
  ...Default.args,
  chevron: 'top',
};

export const Counter = Template.bind({});
Counter.args = {
  ...Default.args,
  counter: 9999,
};
export const IsLoading = Template.bind({});
IsLoading.args = {
  ...Counter.args,
  isLoading: true,
};

export const LongerText = Template.bind({});
LongerText.args = {
  ...Default.args,
  title: 'Johann Gambolputty',
};

export const VeryLongText = Template.bind({});
VeryLongText.args = {
  ...Default.args,
  title:
    'Johann Gambolputty de von Ausfern-schplenden-schlitter-crasscrenbon-fried-digger-dingle-dangle-dongle-dungle-burstein-von-knacker-thrasher-apple-banger-horowitz-ticolensic-grander-knotty-spelltinkle-grandlich-grumblemeyer-spelterwasser-kurstlich-himbleeisen-bahnwagen-gutenabend-bitte-ein-nürnburger-bratwustle-gerspurten-mitzweimache-luber-hundsfut-gumberaber-shönendanker-kalbsfleisch-mittler-aucher von Hautkopft of Ulm',
};

export const NoMenu = Template.bind({});
NoMenu.args = {
  ...Default.args,
  noMenu: true,
};
