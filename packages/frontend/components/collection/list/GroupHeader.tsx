import { Heading } from '@chakra-ui/react';

export interface GroupHeaderProps {
  title: string;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ title }) => {
  return (
    <Heading
      p={2}
      fontSize="2xl"
      backgroundColor="var(--chakra-colors-chakra-body-bg)"
    >
      {title}
    </Heading>
  );
};
