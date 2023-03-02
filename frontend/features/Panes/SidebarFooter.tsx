import { useGetUser } from '@features/Auth';
import { useGetPreferences } from '@features/Preferences';
import { defaultPreferences, placeholderUser } from '@shared';
import { SidebarFooter as SidebarFooterComponent } from '@components/sidebar/SidebarFooter';

export const SidebarFooter: React.FC = () => {
  const { data: user } = useGetUser();
  const { data: preferences } = useGetPreferences();

  return (
    <SidebarFooterComponent
      user={user ?? placeholderUser}
      preferences={preferences ?? defaultPreferences}
    />
  );
};
