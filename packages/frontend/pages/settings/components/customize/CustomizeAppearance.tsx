import React from 'react';
import { Center, Icon, Radio, VStack } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import MoonIcon from '@heroicons/react/solid/MoonIcon';
import SunIcon from '@heroicons/react/solid/SunIcon';
import {
  CollectionLayout,
  CollectionLayouts,
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
}

const initialValues: CustomizeAppearanceData = {
  theme: 'dark',
  defaultCollectionLayout: defaultCollectionLayout,
};

export interface CustomizeAppearanceProps {
  currentData?: CustomizeAppearanceData;
  onChange: (data: CustomizeAppearanceData) => void;
}

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
                CollectionLayouts.map((value) => {
                  const radio = getRadioProps({ value });
                  return (
                    <Radio key={value} {...radio}>
                      {CollectionLayoutName[value]}
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
