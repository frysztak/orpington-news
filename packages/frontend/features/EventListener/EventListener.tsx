import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import { getUrls } from '@api';
import { ReactFCC } from '@utils/react';
import { Msg } from '@orpington-news/shared';

type EventListener = (msg: Msg) => void;
type Status = 'connecting' | 'connected' | 'error';

export interface EventListenerContextData {
  addEventListener: (listener: EventListener) => void;
  removeEventListener: (listener: EventListener) => void;
  attemptToConnect: () => void;

  lastPing: number | null;
  status: Status;
}

const EventListenerContext = createContext<EventListenerContextData | null>(
  null
);

class RetriableError extends Error {}
class FatalError extends Error {}

export const EventListenerContextProvider: ReactFCC = ({ children }) => {
  const [status, setStatus] = useState<Status>('connecting');
  const [lastPing, setLastPing] = useState<number | null>(null);
  const listeners = useRef<Array<EventListener>>([]);
  const addEventListener = useCallback((listener: EventListener) => {
    listeners.current = [...listeners.current, listener];
  }, []);
  const removeEventListener = useCallback((listener: EventListener) => {
    listeners.current = listeners.current.filter((l) => l !== listener);
  }, []);

  function connectToEventSource() {
    const { apiUrl } = getUrls();
    fetchEventSource(`${apiUrl}/events`, {
      openWhenHidden: true,
      keepalive: true,
      credentials: 'include',
      mode: 'cors',
      async onopen(response) {
        if (
          response.ok &&
          response.headers.get('content-type') === EventStreamContentType
        ) {
          setStatus('connected');
          return; // everything's good
        } else if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          // client-side errors are usually non-retriable:
          throw new FatalError();
        } else {
          throw new RetriableError();
        }
      },
      onmessage(ev) {
        console.debug(`[SSE] Received new message:`, ev);
        setLastPing(Date.now());
        if (ev.data) {
          const msg: Msg = JSON.parse(ev.data);
          for (const listener of listeners.current) {
            listener(msg);
          }
        }
      },
      onclose() {
        // if the server closes the connection unexpectedly, retry:
        throw new RetriableError();
      },
      onerror(err) {
        if (err instanceof FatalError) {
          setStatus('error');
          throw err;
        } else {
          // do nothing to automatically retry. You can also
          // return a specific retry interval here.
        }
      },
    }).catch((err) => {
      console.error(err);
    });
  }

  useEffect(() => {
    connectToEventSource();

    return () => {
      listeners.current.length = 0;
    };
  }, []);

  const attemptToConnect = useCallback(() => {
    if (status === 'connected') {
      return;
    }
    setStatus('connecting');
    connectToEventSource();
  }, [status]);

  return (
    <EventListenerContext.Provider
      value={{
        addEventListener,
        removeEventListener,
        attemptToConnect,
        lastPing,
        status,
      }}
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
