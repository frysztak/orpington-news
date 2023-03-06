import cx from 'classnames';
import NextLink from 'next/link';
import { Divider, Button } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { ReactFCC } from '@utils/react';
import { SettingsSidebar } from './components/sidebar/SettingsSidebar';

export interface SettingsLayoutProps {}

export const SettingsLayout: ReactFCC<SettingsLayoutProps> = ({ children }) => {
  return (
    <>
      <div className="hidden md:flex w-full h-full items-start flex-grow">
        <div className="flex w-60 h-[100vh] items-start px-2 gap-x-2 flex-shrink-0">
          <SettingsSidebar py={4} />
          <Divider orientation="vertical" h="full" />
        </div>
        {children}
      </div>

      <div
        className={cx(
          'flex md:hidden flex-col items-start flex-grow gap-2',
          'h-full w-full pt-4 px-2'
        )}
      >
        <Button
          as={NextLink}
          href="/settings"
          mx={4}
          height={8}
          leftIcon={<IoReturnUpBack />}
          variant="link"
        >
          Go back
        </Button>
        {children}
      </div>
    </>
  );
};
