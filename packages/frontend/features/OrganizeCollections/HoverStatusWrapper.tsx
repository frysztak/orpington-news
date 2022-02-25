import { Box, forwardRef, Tooltip, TooltipProps } from '@chakra-ui/react';
import { Collection } from '@orpington-news/shared';
import { HoverStatus } from './dndTypes';
import { StatusLine } from './StatusLine';

/**
 * React-DnD stops working if dragged component is at first unwrapped,
 * and gets wrapped in something (here it's Tooltip) in subsequent renders.
 */
const WithTooltip = forwardRef<TooltipProps, 'div'>(
  ({ children, ...rest }, ref) => (
    <Tooltip isOpen={false} {...rest}>
      {children}
    </Tooltip>
  )
);

export interface HoverStatusWrapperProps {
  collection: Collection;
  hoverStatus?: HoverStatus;
}

export const HoverStatusWrapper = forwardRef<HoverStatusWrapperProps, 'div'>(
  (props, ref) => {
    const { collection, hoverStatus, children } = props;
    if (!hoverStatus) {
      return (
        <Box w="full" ref={ref}>
          <WithTooltip>{children}</WithTooltip>
        </Box>
      );
    }

    switch (hoverStatus.status) {
      case 'dropLocationForbidden': {
        return (
          <Box w="full" ref={ref}>
            <WithTooltip
              placement="left"
              label={hoverStatus.reason}
              isOpen={hoverStatus.location === collection.id}
              hasArrow
              maxW={28}
              boxShadow="dark-lg"
              rounded="md"
            >
              {children}
            </WithTooltip>
          </Box>
        );
      }
      case 'dropLocationAllowed': {
        return (
          <Box ref={ref} w="full">
            {hoverStatus.location === collection.id &&
              hoverStatus.logicalPosition === 'above' && (
                <StatusLine logicalPosition={hoverStatus.logicalPosition} />
              )}
            <WithTooltip>{children}</WithTooltip>
            {hoverStatus.location === collection.id &&
              hoverStatus.logicalPosition !== 'above' && (
                <StatusLine logicalPosition={hoverStatus.logicalPosition} />
              )}
          </Box>
        );
      }
    }
  }
);
