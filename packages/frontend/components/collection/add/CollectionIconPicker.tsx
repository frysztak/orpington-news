import React from 'react';
import {
  BoxProps,
  Icon,
  IconButton,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CollectionIcons, CollectionIconType } from '@orpington-news/shared';
import { getCollectionIcon } from '@components/sidebar/CollectionIcon';
import { useIconFill } from '@utils/icon';

export type CollectionIconPickerProps = {
  value?: CollectionIconType;
  onIconSelected: (icon: CollectionIconType) => void;
} & BoxProps;

export const CollectionIconPicker: React.FC<CollectionIconPickerProps> = (
  props
) => {
  const { value, onIconSelected, ...rest } = props;

  const fill = useIconFill();
  const bgColor = useColorModeValue('purple.100', 'purple.300');

  const handleOnClick = (icon: CollectionIconType) => () =>
    onIconSelected(icon);

  return (
    <Wrap spacing={2} {...rest}>
      {CollectionIcons.map((icon: CollectionIconType) => {
        return (
          <WrapItem key={icon}>
            <IconButton
              variant="ghost"
              aria-label={icon}
              backgroundColor={icon === value ? bgColor : ''}
              icon={<Icon as={getCollectionIcon(icon)} fill={fill} />}
              onClick={handleOnClick(icon)}
            />
          </WrapItem>
        );
      })}
    </Wrap>
  );
};
