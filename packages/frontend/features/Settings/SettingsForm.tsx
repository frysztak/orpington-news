import React, { useCallback } from 'react';
import { Button, VStack, HStack, Icon, Center } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import MoonIcon from '@heroicons/react/solid/MoonIcon';
import SunIcon from '@heroicons/react/solid/SunIcon';
import CogIcon from '@heroicons/react/solid/CogIcon';
import * as Yup from 'yup';
import { FieldListener, RadioGroupField } from '@components/forms';
import { RadioButton } from './RadioButton';

const themeOptions = ['dark', 'light', 'system'] as const;
export type ThemeOption = typeof themeOptions[number];
const getThemeIcon = (theme: ThemeOption): React.FC => {
  switch (theme) {
    case 'dark':
      return MoonIcon;
    case 'light':
      return SunIcon;
    case 'system':
      return CogIcon;
  }
};

export interface SettingsFormData {
  theme: ThemeOption;
}

const initialValues: SettingsFormData = {
  theme: 'system',
};

export const validationSchema = Yup.object({
  theme: Yup.string().oneOf(themeOptions as unknown as string[]),
});

export interface SettingsFormProps {
  initialData?: SettingsFormData;
  onThemeChanged?: (theme: ThemeOption) => void;
  onSubmit: (data: SettingsFormData) => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = (props) => {
  const { initialData, onThemeChanged, onSubmit } = props;

  const handleSubmit = useCallback(
    (data: SettingsFormData) => {
      onSubmit(data);
    },
    [onSubmit]
  );

  return (
    <Formik
      initialValues={initialData ?? initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values }) => (
        <Form noValidate>
          <VStack spacing={4} w="full">
            <RadioGroupField label="Application theme" name="theme">
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

            <FieldListener value={values.theme} cb={onThemeChanged} />

            <HStack w="full" justify="flex-end">
              <Button type="submit" w={['full', 40]} mt={4}>
                Save
              </Button>
            </HStack>
          </VStack>
        </Form>
      )}
    </Formik>
  );
};
