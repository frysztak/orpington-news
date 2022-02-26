import React from 'react';
import { Center, Icon, VStack } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import MoonIcon from '@heroicons/react/solid/MoonIcon';
import SunIcon from '@heroicons/react/solid/SunIcon';
import { RadioGroupField, AutoSave } from '@components/forms';
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
}

const initialValues: CustomizeAppearanceData = {
  theme: 'dark',
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

            <AutoSave />
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
