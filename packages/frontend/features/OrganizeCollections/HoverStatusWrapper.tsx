import {
  Box,
  forwardRef,
  PlacementWithLogical,
  Tooltip,
  TooltipProps,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Collection } from '@orpington-news/shared';
import { HoverStatus } from './dndTypes';
import { StatusLine } from './StatusLine';

/**
 * `dndRef` encompasses entire component, including 'drop location allowed' lines (if visible) - this allows
 * to drop elements on those lines.
 *
 * `ref` is used by `framer-motion` (https://www.framer.com/docs/component/#custom-components) and it encompasses
 * only children - this is important, because framer-motion expects animated component to remain the same size.
 * if it doesn't - because e.g. 'drop location allowed' line appeared - animation gets messy
 */

export interface HoverStatusWrapperProps {
  collection: Collection;
  hoverStatus?: HoverStatus;
  dndRef?: React.Ref<HTMLDivElement>;
  children?: React.ReactNode;
}

export const HoverStatusWrapper = forwardRef<HoverStatusWrapperProps, 'div'>(
  (props, ref) => {
    const { collection, hoverStatus, dndRef, children } = props;

    const placement = useBreakpointValue<PlacementWithLogical>(
      { base: 'bottom', md: 'left' },
      'md'
    );

    const tooltipProps: Omit<TooltipProps, 'children'> =
      hoverStatus?.status === 'dropLocationForbidden'
        ? {
            placement,
            label: hoverStatus.reason,
            isOpen: hoverStatus.location === collection.id,
            hasArrow: true,
            maxW: 28,
            boxShadow: 'dark-lg',
            rounded: 'md',
          }
        : {};

    return (
      <Box w="full" ref={dndRef}>
        {hoverStatus?.status === 'dropLocationAllowed' &&
          hoverStatus.location === collection.id &&
          hoverStatus.logicalPosition === 'above' && (
            <StatusLine logicalPosition={hoverStatus.logicalPosition} />
          )}

        <Box w="full" ref={ref}>
          <Tooltip isOpen={false} closeOnEsc={false} {...tooltipProps}>
            {children}
          </Tooltip>
        </Box>

        {hoverStatus?.status === 'dropLocationAllowed' &&
          hoverStatus.location === collection.id &&
          hoverStatus.logicalPosition !== 'above' && (
            <StatusLine logicalPosition={hoverStatus.logicalPosition} />
          )}
      </Box>
    );
  }
);
