import { useState, useCallback } from 'react';
import { useColorMode, useToast } from '@chakra-ui/react';
import { CustomizeAppearanceData } from './CustomizeAppearance';

export const useCustomizeSettings = () => {
  const toast = useToast();
  const { setColorMode, colorMode } = useColorMode();
  const [currentSettings, setCurrentSettings] =
    useState<CustomizeAppearanceData>({
      theme: colorMode,
    });

  const onSettingsChange = useCallback(
    (data: CustomizeAppearanceData) => {
      const { theme } = data;
      setColorMode(theme);
      setCurrentSettings((values) => ({ ...values, theme }));
      toast({
        status: 'success',
        description: 'Settings saved!',
        isClosable: true,
      });
    },
    [setColorMode, toast]
  );

  return {
    onSettingsChange,
    currentSettings,
  };
};
