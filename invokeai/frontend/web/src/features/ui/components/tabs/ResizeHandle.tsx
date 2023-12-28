import type { FlexProps } from '@chakra-ui/react';
import { Box, Flex } from '@chakra-ui/react';
import { memo } from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

type ResizeHandleProps = Omit<FlexProps, 'direction'> & {
  direction?: 'horizontal' | 'vertical';
  collapsedDirection?: 'top' | 'bottom' | 'left' | 'right';
  isCollapsed?: boolean;
};

const ResizeHandle = (props: ResizeHandleProps) => {
  const {
    direction = 'horizontal',
    collapsedDirection,
    isCollapsed = false,
    ...rest
  } = props;

  if (direction === 'horizontal') {
    return (
      <PanelResizeHandle
        style={{
          visibility: isCollapsed ? 'hidden' : 'visible',
          width: isCollapsed ? 0 : 'auto',
        }}
      >
        <Flex
          className="resize-handle-horizontal"
          sx={{
            w: collapsedDirection ? 2.5 : 4,
            h: 'full',
            justifyContent: collapsedDirection
              ? collapsedDirection === 'left'
                ? 'flex-start'
                : 'flex-end'
              : 'center',
            alignItems: 'center',
            div: {
              bg: 'base.850',
            },
            _hover: {
              div: { bg: 'base.700' },
            },
          }}
          {...rest}
        >
          <Box
            sx={{
              w: 1,
              h: 'calc(100% - 1rem)',
              borderRadius: 'base',
              transitionProperty: 'common',
              transitionDuration: 'normal',
            }}
          />
        </Flex>
      </PanelResizeHandle>
    );
  }

  return (
    <PanelResizeHandle
      style={{
        visibility: isCollapsed ? 'hidden' : 'visible',
        width: isCollapsed ? 0 : 'auto',
      }}
    >
      <Flex
        className="resize-handle-vertical"
        sx={{
          w: 'full',
          h: collapsedDirection ? 2.5 : 4,
          alignItems: collapsedDirection
            ? collapsedDirection === 'top'
              ? 'flex-start'
              : 'flex-end'
            : 'center',
          justifyContent: 'center',
          div: {
            bg: 'base.850',
          },
          _hover: {
            div: { bg: 'base.700' },
          },
        }}
        {...rest}
      >
        <Box
          sx={{
            h: 1,
            w: 'calc(100% - 1rem)',
            borderRadius: 'base',
            transitionProperty: 'common',
            transitionDuration: 'normal',
          }}
        />
      </Flex>
    </PanelResizeHandle>
  );
};

export default memo(ResizeHandle);
