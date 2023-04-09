import React from 'react';
import { IconButton } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';

export interface ArticleSidebarProps {
  disableActionButtons?: boolean;
  showGoBackButtonForDesktop?: boolean;
  onGoBackClicked?: () => void;
}

export const ArticleSidebar: React.FC<ArticleSidebarProps> = ({
  disableActionButtons,
  showGoBackButtonForDesktop,
  onGoBackClicked,
}) => {
  return showGoBackButtonForDesktop ? (
    <div className="hidden lg:flex flex-row m-4 max-h-40 border-r border-r-whiteAlpha-300">
      <IconButton
        icon={<IoReturnUpBack />}
        aria-label="Go back to collection"
        variant="ghost"
        onClick={onGoBackClicked}
        isDisabled={disableActionButtons}
        data-test="goBack"
        mr={2}
      />
    </div>
  ) : null;
};
