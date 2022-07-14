import { useCallback, useRef } from 'react';

/* 
  Based on https://developer.chrome.com/blog/overscroll-behavior/#disabling-pull-to-refresh
*/

export interface PullToRefreshOptions {
  isRefreshing: boolean;
  onRefresh?: () => void;
}

export const usePullToRefresh = ({
  isRefreshing,
  onRefresh,
}: PullToRefreshOptions) => {
  const startY = useRef(-1);

  const touchStartHandler: React.TouchEventHandler<HTMLDivElement> =
    useCallback((event) => {
      startY.current = event.touches[0].pageY;
    }, []);

  const touchMoveHandler: React.TouchEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      const y = event.touches[0].pageY;
      // Activate custom pull-to-refresh effects when at the top of the container
      // and user is scrolling up.
      if (
        event.currentTarget.scrollTop === 0 &&
        y > startY.current &&
        !isRefreshing
      ) {
        onRefresh?.();
      }
    },
    [isRefreshing, onRefresh]
  );

  return { touchStartHandler, touchMoveHandler };
};
