import { useState, useCallback } from 'react';
import { useColorMode, useToast } from '@chakra-ui/react';
import { useMutation } from 'react-query';
import { useLocalStorage } from 'usehooks-ts';
import { useGetPreferences } from '@features/Preferences';
import {
  defaultArticleFontFamily,
  defaultArticleFontSize,
  defaultArticleMonoFontFamily,
  defaultAvatarStyle,
  defaultCollectionLayout,
} from '@orpington-news/shared';
import { SaveablePreferences, savePreferences, useApi } from '@api';
import { CustomizeAppearanceData } from './types';

export const useCustomizeSettings = () => {
  const toast = useToast();
  const { setColorMode, colorMode } = useColorMode();
  const { data: preferences } = useGetPreferences();
  const [articleFontSize, setArticleFontSize] = useLocalStorage(
    'articleFontSize',
    defaultArticleFontSize
  );
  const [articleFontFamily, setArticleFontFamily] = useLocalStorage(
    'articleFontFamily',
    defaultArticleFontFamily
  );
  const [articleMonoFontFamily, setArticleMonoFontFamily] = useLocalStorage(
    'articleMonoFontFamily',
    defaultArticleMonoFontFamily
  );

  const [currentSettings, setCurrentSettings] =
    useState<CustomizeAppearanceData>({
      theme: colorMode,
      defaultCollectionLayout:
        preferences?.defaultCollectionLayout ?? defaultCollectionLayout,
      avatarStyle: preferences?.avatarStyle ?? defaultAvatarStyle,
      articleFontSize,
      articleFontFamily,
      articleMonoFontFamily,
    });

  const api = useApi();
  const { mutate } = useMutation(
    (prefs: SaveablePreferences) => savePreferences(api, prefs),
    {
      onSuccess: () => {
        toast({
          status: 'success',
          description: 'Settings saved!',
          isClosable: true,
        });
      },
    }
  );

  const onSettingsChange = useCallback(
    (data: CustomizeAppearanceData) => {
      setColorMode(data.theme);
      setArticleFontSize(data.articleFontSize);
      setArticleFontFamily(data.articleFontFamily);
      setArticleMonoFontFamily(data.articleMonoFontFamily);

      setCurrentSettings((values) => ({
        ...values,
        theme: data.theme,
        articleFontSize: data.articleFontSize,
        articleFontFamily: data.articleFontFamily,
        articleMonoFontFamily: data.articleMonoFontFamily,
      }));
      mutate(data);
    },
    [
      mutate,
      setArticleFontFamily,
      setArticleFontSize,
      setArticleMonoFontFamily,
      setColorMode,
    ]
  );

  return {
    onSettingsChange,
    currentSettings,
  };
};
