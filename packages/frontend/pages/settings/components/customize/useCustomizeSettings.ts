import { useState, useCallback } from 'react';
import { useColorMode, useToast } from '@chakra-ui/react';
import { useMutation } from 'react-query';
import { usePreferencesContext } from '@features/Preferences';
import { defaultCollectionLayout } from '@orpington-news/shared';
import { SaveablePreferences, savePreferences, useApi } from '@api';
import { CustomizeAppearanceData } from './CustomizeAppearance';

export const useCustomizeSettings = () => {
  const toast = useToast();
  const { setColorMode, colorMode } = useColorMode();
  const { preferences } = usePreferencesContext();
  const [currentSettings, setCurrentSettings] =
    useState<CustomizeAppearanceData>({
      theme: colorMode,
      defaultCollectionLayout:
        preferences?.defaultCollectionLayout ?? defaultCollectionLayout,
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
      const { theme } = data;
      setColorMode(theme);
      setCurrentSettings((values) => ({ ...values, theme }));
      mutate(data);
    },
    [mutate, setColorMode]
  );

  return {
    onSettingsChange,
    currentSettings,
  };
};
