// https://github.com/tannerlinsley/react-virtual/discussions/212#discussioncomment-1587478
// https://codesandbox.io/s/usevirtualresizeobserver-04-11-2021-75ye2?file=/src/useVirtual.tsx:0-2829

import * as React from 'react';
import { useVirtual as useVirtualImpl, VirtualItem } from 'react-virtual';

export type { VirtualItem };

// TODO Options type should be exported from react-virtual to replace this
type ReactVirtualOptions<T> = Parameters<typeof useVirtualImpl>[0] & {
  parentRef: React.RefObject<T>; // this override is needed because Parameters<> cannot handle generics
};

const defaultKeyExtractor = (index: number) => index;

interface Options<T> extends ReactVirtualOptions<T> {
  updateSize?: boolean; // when list is hidden by display none, by setting updateSize={false} we can skip RO callbacks
}

export const useVirtual = <T extends HTMLElement>({
  updateSize = true,
  ...options
}: Options<T>) => {
  const measureRefCacheRef = React.useRef<
    Record<string, (el: HTMLElement | null) => void>
  >({});
  const elCacheRef = React.useRef<Record<string, Element | null>>({});

  const update = (key: number | string, el: HTMLElement) => {
    if (updateSize) {
      measureRefCacheRef.current[key](el);
    }
  };
  const updateRef = React.useRef(update);
  updateRef.current = update;

  const roRef = React.useRef(
    new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const attribute = 'data-key';
        const key = el.getAttribute(attribute);

        if (key === null) {
          throw new Error(`Value not found, for '${attribute}' attribute`);
        }

        const htmlEl = el as HTMLElement;

        updateRef.current(key, htmlEl);
      });
    })
  );

  React.useEffect(() => {
    const ro = roRef.current;
    return () => {
      ro.disconnect();
    };
  }, []);

  const { size, keyExtractor = defaultKeyExtractor } = options;

  const cachedMeasureRefWrappers = React.useMemo(() => {
    const makeMeasureRefWrapperForItem =
      (key: string | number) => (el: HTMLElement | null) => {
        if (elCacheRef.current[key]) {
          roRef.current.unobserve(elCacheRef.current[key]!);
        }

        if (el) {
          // sync
          updateRef.current(key, el);
          // observe
          roRef.current.observe(el);
        }

        elCacheRef.current[key] = el;
      };

    const refsAcc: Record<string, (el: HTMLElement | null) => void> = {};

    for (let i = 0; i < size; i++) {
      const key = keyExtractor(i);

      refsAcc[key] = makeMeasureRefWrapperForItem(key);
    }

    return refsAcc;
  }, [size, keyExtractor]);

  const rowVirtualizer = useVirtualImpl(options);

  const virtualItems = rowVirtualizer.virtualItems.map((item) => {
    measureRefCacheRef.current[item.key] = item.measureRef;

    return {
      ...item,
      measureRef: cachedMeasureRefWrappers[item.key],
    };
  });

  return { ...rowVirtualizer, virtualItems };
};

export type Virtualizer = ReturnType<typeof useVirtual>;
