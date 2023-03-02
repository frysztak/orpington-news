import React from 'react';
import { Box, Center, Icon, Radio, Stack } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import {
  AvatarStyle,
  CollectionLayout,
  defaultArticleFontFamily,
  defaultArticleFontSize,
  defaultArticleMonoFontFamily,
  defaultAvatarStyle,
  defaultCollectionLayout,
} from '@shared';
import { RadioGroupField, AutoSave } from '@components/forms';
import { CollectionLayoutName } from '@components/collection/types';
import { RadioButton } from './RadioButton';
import { ArticleSettings } from './ArticleSettings';
import { CustomizeAppearanceData, ThemeOption, themeOptions } from './types';
import { ArticlePreview } from './ArticlePreview';

const getThemeIcon = (theme: ThemeOption): React.FC => {
  switch (theme) {
    case 'dark':
      return MoonIcon;
    case 'light':
      return SunIcon;
  }
};

const initialValues: CustomizeAppearanceData = {
  theme: 'dark',
  defaultCollectionLayout: defaultCollectionLayout,
  avatarStyle: defaultAvatarStyle,
  articleFontFamily: defaultArticleFontFamily,
  articleMonoFontFamily: defaultArticleMonoFontFamily,
  articleFontSize: defaultArticleFontSize,
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
        <Form noValidate style={{ maxWidth: '100%' }}>
          <Stack
            spacing={{ base: 4, lg: 8 }}
            w="full"
            align="flex-start"
            direction={{ base: 'column', lg: 'row' }}
          >
            <Stack
              spacing={4}
              align="flex-start"
              direction="column"
              flexShrink={0}
              flexGrow={1}
              maxW={{ base: 'full', md: 'sm' }}
            >
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
                  CollectionLayout.options.map((value: CollectionLayout) => {
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
                  AvatarStyle.options.map((value: AvatarStyle) => {
                    const radio = getRadioProps({ value });
                    return (
                      <Radio key={value} {...radio}>
                        {AvatarStylesNames[value]}
                      </Radio>
                    );
                  })
                }
              </RadioGroupField>

              <ArticleSettings />
            </Stack>

            <Box w="full" display={{ base: 'none', md: 'block' }}>
              <ArticlePreview />
            </Box>

            <AutoSave />
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
