import { useCallback, useRef } from 'react';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { hotkeyScopeNone } from './scopes';

export const useDisableHotKeys = () => {
  const { enableScope, disableScope, enabledScopes } = useHotkeysContext();

  const scopes = useRef(enabledScopes);

  const disableHotkeys = useCallback(() => {
    scopes.current = enabledScopes;
    for (const scope of enabledScopes) {
      if (scope !== hotkeyScopeNone) {
        disableScope(scope);
      }
    }
  }, [disableScope, enabledScopes]);

  const enableHotkeys = useCallback(() => {
    for (const scope of scopes.current) {
      enableScope(scope);
    }
  }, [enableScope]);

  return { disableHotkeys, enableHotkeys };
};
