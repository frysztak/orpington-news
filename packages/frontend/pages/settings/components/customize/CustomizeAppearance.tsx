import React from 'react';
import { Center, Icon, Radio, VStack } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import MoonIcon from '@heroicons/react/solid/MoonIcon';
import SunIcon from '@heroicons/react/solid/SunIcon';
import {
  AvatarStyle,
  AvatarStyles,
  CollectionLayout,
  CollectionLayouts,
  defaultAvatarStyle,
  defaultCollectionLayout,
} from '@orpington-news/shared';
import { RadioGroupField, AutoSave } from '@components/forms';
import { CollectionLayoutName } from '@components/collection/types';
import { RadioButton } from './RadioButton';

const themeOptions = ['dark', 'light'] as const;
export type ThemeOption = typeof themeOptions[number];
const getThemeIcon = (theme: ThemeOption): React.FC => {
  switch (theme) {
    case 'dark':
      return MoonIcon;
    case 'light':
      return SunIcon;
  }
};

export interface CustomizeAppearanceData {
  theme: ThemeOption;
  defaultCollectionLayout: CollectionLayout;
  avatarStyle: AvatarStyle;
}

const initialValues: CustomizeAppearanceData = {
  theme: 'dark',
  defaultCollectionLayout: defaultCollectionLayout,
  avatarStyle: defaultAvatarStyle,
};

export interface CustomizeAppearanceProps {
  currentData?: CustomizeAppearanceData;
  onChange: (data: CustomizeAppearanceData) => void;
}

const AvatarStylesNames: Record<AvatarStyle, string> = {
  fallback: 'Silhouette',
  initials: 'Initials',
};

export const CustomizeAppearance: React.FC<CustomizeAppearanceProps> = (
  props
) => {
  const { currentData, onChange } = props;

  return (
    <Formik initialValues={currentData ?? initialValues} onSubmit={onChange}>
      {({ values }) => (
        <Form noValidate>
          <VStack spacing={4} w="full">
            <RadioGroupField label="Theme" name="theme">
              {({ getRadioProps }) =>
                themeOptions.map((value) => {
                  const radio = getRadioProps({ value });
                  return (
                    <RadioButton key={value} {...radio}>
                      <Center p={3}>
                        <Icon as={getThemeIcon(value)} boxSize={6} />
                      </Center>
                    </RadioButton>
                  );
                })
              }
            </RadioGroupField>

            <RadioGroupField
              label="Default collection layout"
              name="defaultCollectionLayout"
            >
              {({ getRadioProps }) =>
                CollectionLayouts.map((value: CollectionLayout) => {
                  const radio = getRadioProps({ value });
                  return (
                    <Radio key={value} {...radio}>
                      {CollectionLayoutName[value]}
                    </Radio>
                  );
                })
              }
            </RadioGroupField>

            <RadioGroupField label="Avatar style" name="avatarStyle">
              {({ getRadioProps }) =>
                AvatarStyles.map((value: AvatarStyle) => {
                  const radio = getRadioProps({ value });
                  return (
                    <Radio key={value} {...radio}>
                      {AvatarStylesNames[value]}
                    </Radio>
                  );
                })
              }
            </RadioGroupField>

            <AutoSave />
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
