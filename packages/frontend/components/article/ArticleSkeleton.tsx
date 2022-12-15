import { Divider, HStack, IconButton } from '@chakra-ui/react';
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink';
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
      <HStack w="full" justify="flex-end">
        <IconButton
          icon={<IoReturnUpBack />}
          aria-label="Go back to collection"
          variant="ghost"
          mr="auto"
          onClick={onGoBackClicked}
          display={{ base: 'inline-flex', lg: 'none' }}
        />

        <IconButton
          icon={<HiOutlineExternalLink />}
          isDisabled
          aria-label="Open external link"
          variant="ghost"
        />

        <IconButton
          aria-label="Menu"
          icon={<BsThreeDotsVertical />}
          isDisabled
          variant="ghost"
        />
      </HStack>

      <div className="flex flex-col w-full items-start gap-2 px-4">
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
