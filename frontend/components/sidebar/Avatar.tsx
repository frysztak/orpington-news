import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { AiOutlineUser } from '@react-icons/all-files/ai/AiOutlineUser';
import { HiOutlineUpload } from '@react-icons/all-files/hi/HiOutlineUpload';
import { AiOutlineDelete } from '@react-icons/all-files/ai/AiOutlineDelete';
import { AvatarStyle } from '@shared';

export interface AvatarProps {
  name: string;
  avatarStyle: AvatarStyle;
  src?: string;
  badge?: 'upload' | 'delete';

  onOpenAvatarSelection?: () => void;
  onDeleteAvatar?: () => void;
}

const getAvatarUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  if (url.startsWith('data:image')) {
    return url;
  }

  return process.env.NEXT_PUBLIC_API_URL
    ? new URL(url, process.env.NEXT_PUBLIC_API_URL).toString()
    : url;
};

export const Avatar: React.FC<AvatarProps> = (props) => {
  const {
    name,
    avatarStyle,
    src,
    badge,
    onOpenAvatarSelection,
    onDeleteAvatar,
  } = props;

  const bg = useColorModeValue('purple.500', 'purple.200');

  return (
    <ChakraAvatar
      src={getAvatarUrl(src)}
      name={avatarStyle === 'initials' ? name : undefined}
      bg={bg}
      color="white"
      icon={<AiOutlineUser fontSize="1.5rem" />}
      userSelect="none"
      title={name}
      data-test="avatar"
    >
      {badge === 'upload' ? (
        <ChakraAvatarBadge boxSize="1.25em" bg="green.500">
          <IconButton
            aria-label="Upload avatar"
            icon={<HiOutlineUpload />}
            size="xs"
            variant="ghost"
            borderRadius="full"
            color="white"
            onClick={onOpenAvatarSelection}
            data-test="avatarBadgeUpload"
          />
        </ChakraAvatarBadge>
      ) : badge === 'delete' ? (
        <ChakraAvatarBadge boxSize="1.25em" bg="red.600">
          <IconButton
            aria-label="Delete avatar"
            icon={<AiOutlineDelete />}
            size="xs"
            variant="ghost"
            borderRadius="full"
            color="white"
            onClick={onDeleteAvatar}
            data-test="avatarBadgeDelete"
          />
        </ChakraAvatarBadge>
      ) : null}
    </ChakraAvatar>
  );
};
