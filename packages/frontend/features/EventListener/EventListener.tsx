import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { sseUrl } from '@api';
import { Msg } from '@orpington-news/shared';

type EventListener = (msg: Msg) => void;

export interface EventListenerContextData {
  addEventListener: (listener: EventListener) => void;
  removeEventListener: (listener: EventListener) => void;
}

const EventListenerContext =
  createContext<EventListenerContextData | null>(null);

export const EventListenerContextProvider: React.FC = ({ children }) => {
  const listeners = useRef<Array<EventListener>>([]);
  const addEventListener = useCallback((listener: EventListener) => {
    listeners.current = [...listeners.current, listener];
  }, []);
  const removeEventListener = useCallback((listener: EventListener) => {
    listeners.current = listeners.current.filter((l) => l !== listener);
  }, []);

  useEffect(() => {
    async function fetchData() {
      await fetchEventSource(sseUrl, {
        openWhenHidden: true,
        onmessage(ev) {
          console.debug(`[SSE] Received new message:`, ev);
          if (ev.data) {
            const msg: Msg = JSON.parse(ev.data);
            for (const listener of listeners.current) {
              listener(msg);
            }
          }
        },
      });
    }

    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      listeners.current.length = 0;
    };
  }, []);

  return (
    <EventListenerContext.Provider
      value={{ addEventListener, removeEventListener }}
    >
      {children}
    </EventListenerContext.Provider>
  );
};

export const useEventListenerContext = () => {
  const context = useContext(EventListenerContext);
  if (!context) {
    throw new Error(
      `useEventListenerContext needs to wrapped in EventListenerContextProvider`
    );
  }

  return context;
};

export const useAddEventListener = (listener: EventListener) => {
  const { addEventListener, removeEventListener } = useEventListenerContext();
  useEffect(() => {
    addEventListener(listener);
    return () => removeEventListener(listener);
  }, [addEventListener, listener, removeEventListener]);
};
