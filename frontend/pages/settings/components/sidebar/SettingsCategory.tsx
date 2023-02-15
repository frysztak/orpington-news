import { chakra, PropsOf, useColorModeValue } from '@chakra-ui/react';

export type SettingsCategoryProps = PropsOf<typeof chakra.div> & {
  title: string;
};

export const SettingsCategory: React.FC<SettingsCategoryProps> = (props) => {
  const { title, children, ...rest } = props;

  return (
    <chakra.div w="full" {...rest}>
      <chakra.p
        px={4}
        textTransform="uppercase"
        letterSpacing="wider"
        fontSize="sm"
        fontWeight="bold"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        userSelect="none"
        color={useColorModeValue('purple.500', 'purple.300')}
      >
        {title}
      </chakra.p>
      <chakra.div role="group" mt={3}>
        {children}
      </chakra.div>
    </chakra.div>
  );
};
