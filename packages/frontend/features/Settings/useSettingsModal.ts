import { useState, useCallback } from 'react';
import { useColorMode, useDisclosure, useToast } from '@chakra-ui/react';
import { SettingsFormData, ThemeOption } from './SettingsForm';

export const useSettingsModal = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const toast = useToast();
  const { setColorMode, colorMode } = useColorMode();
  const [initialData, setInitialData] = useState<SettingsFormData>({
    theme: colorMode,
  });

  const onSubmit = useCallback(
    (data: SettingsFormData) => {
      const { theme } = data;
      setColorMode(theme);
      setInitialData((values) => ({ ...values, theme }));
      toast({
        status: 'success',
        description: 'Settings saved!',
        isClosable: true,
      });
      onClose();
    },
    [onClose, setColorMode, toast]
  );

  const onThemeChanged = useCallback(
    (theme: ThemeOption) => {
      setColorMode(theme);
    },
    [setColorMode]
  );

  const onCloseHandler = useCallback(() => {
    setColorMode(initialData.theme);
    onClose();
  }, [initialData.theme, onClose, setColorMode]);

  return {
    onOpenSettingsModal: onOpen,
    isOpen,
    onClose: onCloseHandler,
    onSubmit,
    onThemeChanged,
    initialData,
  };
};
