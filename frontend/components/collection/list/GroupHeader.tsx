import { Heading } from '@chakra-ui/react';

export interface GroupHeaderProps {
  title: string;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ title }) => {
  return (
    <Heading
      px={2}
      py={4}
      fontSize="2xl"
      backgroundColor="var(--chakra-colors-chakra-body-bg)"
      data-test={`groupHeader-${title}`}
    >
      {title}
    </Heading>
  );
};
