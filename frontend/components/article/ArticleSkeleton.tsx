import { Divider, IconButton } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';

export interface ArticleSkeletonProps {
  onGoBackClicked?: () => void;
}

export const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({
  onGoBackClicked,
}) => {
  return (
    <>
      <div className="flex flex-row w-full px-1 pt-1">
        <IconButton
          icon={<IoReturnUpBack />}
          aria-label="Go back to collection"
          variant="ghost"
          mr="auto"
          onClick={onGoBackClicked}
          display={{ base: 'inline-flex', lg: 'none' }}
        />

        <IconButton
          aria-label="Menu"
          icon={<BsThreeDotsVertical />}
          isDisabled
          variant="ghost"
        />
      </div>

      <div className="flex flex-col w-full items-start gap-2 px-4 pb-4">
        <div className="skeleton w-full h-10" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-4/5" />

        <Divider pt={3} mb={2} />

        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-4/5" />
      </div>
    </>
  );
};
