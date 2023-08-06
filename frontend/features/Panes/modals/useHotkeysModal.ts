import { useHotkeys } from 'react-hotkeys-hook';
import { useContextSelector } from 'use-context-selector';
import { hotkeyScopeGlobal } from '@features/HotKeys/scopes';
import { ModalContext } from './ModalContext';

export const useHotkeysModal = () => {
  const open = useContextSelector(ModalContext, (ctx) => ctx.openHotkeysModal);

  useHotkeys('shift+?', open, { scopes: [hotkeyScopeGlobal] });
};
