import {
  Center,
  Circle,
  CircularProgress,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

export interface RefreshIndicatorProps {
  isRefreshing: boolean;
}

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, y: 100, zIndex: 1000 },
};

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isRefreshing,
}) => {
  const bgColor = useColorModeValue('gray.200', 'gray.700');
  const trackColor = useColorModeValue(undefined, 'gray.300');

  return (
    <Center w="full" h={0}>
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isRefreshing ? 'visible' : 'hidden'}
      >
        <Circle size={10} bgColor={bgColor}>
          <CircularProgress
            size={6}
            isIndeterminate
            color="purple.200"
            trackColor={trackColor}
          />
        </Circle>
      </motion.div>
    </Center>
  );
};
