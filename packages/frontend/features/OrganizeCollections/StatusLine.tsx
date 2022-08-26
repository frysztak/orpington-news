import { chakra, HStack } from '@chakra-ui/react';
import { LogicalPosition } from './dndTypes';

export interface StatusLineProps {
  error?: boolean;
  logicalPosition: LogicalPosition;
}

const Svg = chakra('svg');
const Circle = chakra('circle');
const Line = chakra('line');

const getPadding = (position: LogicalPosition): number => {
  switch (position) {
    case 'belowParent':
      return 1;
    case 'below':
      return 2;
    case 'above':
      return 2;
    case 'child':
      return 6;
  }
};

export const StatusLine: React.FC<StatusLineProps> = (props) => {
  const { error, logicalPosition } = props;

  const stroke = error ? 'red.600' : 'green.400';

  return (
    <HStack
      w="full"
      spacing={0}
      style={{
        paddingLeft: `calc(var(--extra-padding-left) + var(--chakra-space-${getPadding(
          logicalPosition
        )}))`,
      }}
    >
      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 10 10"
        w="10px"
        h="10px"
        flexShrink={0}
      >
        <Circle
          cx={5}
          cy={5}
          r={4}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
        />
      </Svg>

      <Svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 10 10"
        w="full"
        h="10px"
        preserveAspectRatio="none"
      >
        <Line x1="0" x2="100%" y1="5" y2="5" stroke={stroke} strokeWidth="2" />
      </Svg>
    </HStack>
  );
};
