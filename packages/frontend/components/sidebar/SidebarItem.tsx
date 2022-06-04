import React, { MouseEvent, useCallback, useRef } from 'react';
import {
  Badge,
  Box,
  Center,
  forwardRef,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  Spacer,
  Spinner,
  Text,
  useColorModeValue,
  useDisclosure,
  useMergeRefs,
  useOutsideClick,
  VStack,
} from '@chakra-ui/react';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { Chevron } from './Chevron';
import { useIconFill } from '@utils/icon';

export interface SidebarItemProps {
  isActive: boolean;
  icon?: React.FC;
  title: string;
  counter?: number;
  chevron?: 'top' | 'bottom';
  menuItems?: JSX.Element;
  isLoading?: boolean;

  onClick: () => void;
  onChevronClick?: () => void;
}

export const SidebarItem = forwardRef<SidebarItemProps, 'div'>((props, ref) => {
  const {
    isActive,
    icon,
    title,
    counter,
    chevron,
    menuItems,
    isLoading,
    onClick,
    onChevronClick,
    ...rest
  } = props;

  const fg = useIconFill();
  const bg = useColorModeValue('purple.50', 'gray.700');
  const hoverBg = useColorModeValue('purple.10', 'gray.600');

  const { isOpen, onToggle, onClose, onOpen } = useDisclosure();

  const handleMenuClick: React.MouseEventHandler = useCallback(
    (event) => {
      event.stopPropagation();
      onToggle();
    },
    [onToggle]
  );

  const handleClick: React.MouseEventHandler = useCallback(
    (event) => {
      if (isOpen) {
        onClose();
      } else {
        onClick();
      }
    },
    [isOpen, onClick, onClose]
  );

  const internalRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick({
    ref: internalRef,
    handler: useCallback(
      (e: Event) => {
        onClose();
      },
      [onClose]
    ),
  });

  const handleKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      const { key } = event;
      if (key === 'Escape') {
        onClose();
      } else if (key === 'Enter') {
        onClick();
      }
    },
    [onClick, onClose]
  );

  const handleChevronClick = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();
      if (isOpen) {
        onClose();
      } else {
        onChevronClick?.();
      }
    },
    [isOpen, onChevronClick, onClose]
  );

  const handleChevronKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      const { key } = event;

      if (key === ' ') {
        handleChevronClick();
        event.preventDefault();
      }
    },
    [handleChevronClick]
  );

  const refs = useMergeRefs(internalRef, ref);

  return (
    <HStack
      ref={refs}
      w="full"
      spacing={4}
      pr={3}
      pl={chevron ? 0 : 6}
      minH={10}
      align="center"
      _hover={{
        cursor: 'pointer',
        bgColor: hoverBg,
      }}
      _focus={{
        bgColor: hoverBg,
        outline: 'none',
      }}
      bgColor={isActive ? bg : 'inherit'}
      transition="background-color 0.2s"
      userSelect="none"
      role="group"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      {...rest}
    >
      {chevron && (
        <IconButton
          variant="ghost"
          ml={1}
          mr={-3}
          size="2xs"
          aria-label={chevron === 'top' ? 'Collapse menu' : 'Expand menu'}
          icon={<Chevron pointTo={chevron} />}
          onKeyDown={handleChevronKeyDown}
          onClick={handleChevronClick}
        />
      )}
      {icon && <Icon as={icon} w={6} h={6} fill={fg} />}
      <Text flexGrow={1} color={fg} fontWeight={isActive ? 700 : 400} py={2}>
        {title}
      </Text>

      <VStack align="flex-end" spacing={0}>
        {isLoading && (
          <Center h={8} w={8}>
            <Spinner />
          </Center>
        )}
        {!isLoading &&
          !isOpen &&
          (counter ? (
            <Badge
              w={8}
              h={8}
              _groupHover={{
                display: menuItems ? 'none' : '',
              }}
            >
              <Center h="full">{counter > 999 ? '999+' : counter}</Center>
            </Badge>
          ) : (
            <Spacer w={8} h={8} />
          ))}
        {!isLoading && menuItems && (
          <Box
            display={isOpen ? 'block' : 'none'}
            _groupHover={{
              display: 'block',
            }}
          >
            <Menu isOpen={isOpen} onOpen={onOpen} isLazy>
              <MenuButton
                onClick={handleMenuClick}
                as={IconButton}
                aria-label="Menu"
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                size="sm"
                tabIndex={0}
              />
              <MenuList data-focus-visible-disabled>{menuItems}</MenuList>
            </Menu>
          </Box>
        )}
      </VStack>
    </HStack>
  );
});
