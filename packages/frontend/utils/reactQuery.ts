import { InfiniteData } from '@tanstack/react-query';

export const mutatePageData =
  <T>(updater: (data: T) => T) =>
  (oldData: InfiniteData<{ items: T[] }> | undefined) => {
    return (
      oldData && {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          items: page.items.map(updater),
        })),
      }
    );
  };
