import { useCallback, useEffect, useRef, useState } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { getUrl } from '@api';
import { ReactFCC } from '@utils/react';
import { Msg, noop } from '@shared';

type EventListener = (msg: Msg) => void;

export interface EventListenerContextData {
  addEventListener: (listener: EventListener) => void;
  removeEventListener: (listener: EventListener) => void;
  triggerReconnect: () => void;

  status: ReadyState;
}

export const EventListenerContext = createContext<EventListenerContextData>({
  addEventListener: noop,
  removeEventListener: noop,
  triggerReconnect: noop,
  status: ReadyState.UNINSTANTIATED,
});

const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
  } catch {
    return false;
  }
  return true;
};

export const EventListenerContextProvider: ReactFCC = ({ children }) => {
  const listeners = useRef<Array<EventListener>>([]);
  const addEventListener = useCallback((listener: EventListener) => {
    listeners.current = [...listeners.current, listener];
  }, []);
  const removeEventListener = useCallback((listener: EventListener) => {
    listeners.current = listeners.current.filter((l) => l !== listener);
  }, []);

  const getWebSocketUrl = useCallback(() => {
    const apiUrl = getUrl();
    if (isValidUrl(apiUrl)) {
      return `${apiUrl}/events`.replace('http', 'ws');
    }

    const url = new URL('/api/events', window.location.href);
    url.protocol = url.protocol.replace('http', 'ws');
    return url.href;
  }, []);

  const [shouldConnect, setShouldConnect] = useState(true);
  const triggerReconnect = useCallback(() => {
    setShouldConnect(false);
    setTimeout(() => {
      setShouldConnect(true);
    }, 10);
  }, []);

  const { readyState } = useWebSocket(
    getWebSocketUrl,
    {
      shouldReconnect: () => true,
      onMessage: (ev) => {
        if (ev.data) {
          const msg: Msg = JSON.parse(ev.data);
          for (const listener of listeners.current) {
            listener(msg);
          }
        }
      },
    },
    shouldConnect
  );

  return (
    <EventListenerContext.Provider
      value={{
        addEventListener,
        removeEventListener,
        triggerReconnect,
        status: readyState,
      }}
    >
      {children}
    </EventListenerContext.Provider>
  );
};

export const useAddEventListener = (listener: EventListener) => {
  const addEventListener = useContextSelector(
    EventListenerContext,
    (ctx) => ctx.addEventListener
  );
  const removeEventListener = useContextSelector(
    EventListenerContext,
    (ctx) => ctx.removeEventListener
  );

  useEffect(() => {
    addEventListener(listener);
    return () => removeEventListener(listener);
  }, [addEventListener, listener, removeEventListener]);
};
