import cx from 'classnames';

const SidebarItemSkeleton: React.FC<{ nested?: boolean }> = ({ nested }) => {
  return (
    <div
      className={cx(
        'flex items-center gap-4 pr-3 h-10 w-full',
        nested ? 'pl-10' : 'pl-6'
      )}
    >
      <div className="skeleton rounded-full h-6 w-6 flex-shrink-0" />
      <div className="skeleton h-6 p-2 w-full" />
    </div>
  );
};

export const CollectionsSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <SidebarItemSkeleton />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton nested />
    </div>
  );
};
