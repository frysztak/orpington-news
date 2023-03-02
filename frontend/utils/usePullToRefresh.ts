import { useCallback, useEffect, useRef } from 'react';

/* 
  Based on https://developer.chrome.com/blog/overscroll-behavior/#disabling-pull-to-refresh
*/

export interface PullToRefreshOptions {
  scrollerRef: React.MutableRefObject<HTMLElement | null>;
  isRefreshing: boolean;
  onRefresh?: () => void;
}

export const usePullToRefresh = ({
  scrollerRef,
  isRefreshing,
  onRefresh,
}: PullToRefreshOptions) => {
  const startY = useRef(-1);

  const touchStartHandler = useCallback((event: TouchEvent) => {
    startY.current = event.touches[0].pageY;
  }, []);

  const touchMoveHandler: any = useCallback(
    (event: TouchEvent) => {
      const y = event.touches[0].pageY;
      // Activate custom pull-to-refresh effects when at the top of the container
      // and user is scrolling up.
      if (
        scrollerRef.current?.scrollTop === 0 &&
        y > startY.current &&
        !isRefreshing
      ) {
        onRefresh?.();
      }
    },
    [isRefreshing, onRefresh, scrollerRef]
  );

  useEffect(() => {
    const scrollerEl = scrollerRef.current;
    scrollerEl?.addEventListener('touchstart', touchStartHandler, {
      passive: true,
    });
    scrollerEl?.addEventListener('touchmove', touchMoveHandler, {
      passive: true,
    });

    return () => {
      scrollerEl?.removeEventListener('touchstart', touchStartHandler);
      scrollerEl?.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [scrollerRef, touchMoveHandler, touchStartHandler]);

  return { touchStartHandler, touchMoveHandler };
};
