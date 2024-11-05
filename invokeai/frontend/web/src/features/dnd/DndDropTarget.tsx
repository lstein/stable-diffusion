import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForElements, monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForExternal, monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { containsFiles, getFiles } from '@atlaskit/pragmatic-drag-and-drop/external/file';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import type { SystemStyleObject } from '@invoke-ai/ui-library';
import { Box } from '@invoke-ai/ui-library';
import { getStore } from 'app/store/nanostores/store';
import { useAppDispatch } from 'app/store/storeHooks';
import type { AnyDndTarget } from 'features/dnd/dnd';
import { DndDropOverlay } from 'features/dnd/DndDropOverlay';
import type { DndTargetState } from 'features/dnd/types';
import { memo, useEffect, useRef, useState } from 'react';
import { uploadImage } from 'services/api/endpoints/images';
import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];
const ACCEPTED_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];
const MAX_IMAGE_SIZE = 4; //In MegaBytes

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

const sx = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  w: 'full',
  h: 'full',
  pointerEvents: 'auto',
  // We must disable pointer events when idle to prevent the overlay from blocking clicks
  '&[data-dnd-state="idle"]': {
    pointerEvents: 'none',
  },
} satisfies SystemStyleObject;

const zUploadFile = z
  .custom<File>()
  .refine(
    (file) => {
      return sizeInMB(file.size) <= MAX_IMAGE_SIZE;
    },
    () => ({ message: `The maximum image size is ${MAX_IMAGE_SIZE}MB` })
  )
  .refine(
    (file) => {
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    },
    (file) => ({ message: `File type ${file.type} is not supported` })
  )
  .refine(
    (file) => {
      return ACCEPTED_FILE_EXTENSIONS.some((ext) => file.name.endsWith(ext));
    },
    (file) => ({ message: `File extension .${file.name.split('.').at(-1)} is not supported` })
  );

type Props<T extends AnyDndTarget> = {
  dndTarget: T;
  dndTargetData: ReturnType<T['getData']>;
  label: string;
  externalLabel?: string;
  isDisabled?: boolean;
};

export const DndDropTarget = memo(<T extends AnyDndTarget>(props: Props<T>) => {
  const { dndTarget, dndTargetData, label, externalLabel = label, isDisabled } = props;
  const [dndState, setDndState] = useState<DndTargetState>('idle');
  const [dndOrigin, setDndOrigin] = useState<'element' | 'external' | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    if (isDisabled) {
      return;
    }

    const { dispatch, getState } = getStore();

    return combine(
      dropTargetForElements({
        element,
        canDrop: ({ source }) => {
          // TS cannot infer `dndTargetData` but we've just checked it.
          // TODO(psyche): Figure out how to satisfy TS.
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const arg = { sourceData: source.data, targetData: dndTargetData, dispatch, getState } as any;
          return dndTarget.isValid(arg);
        },
        onDragEnter: () => {
          setDndState('over');
        },
        onDragLeave: () => {
          setDndState('potential');
        },
        getData: () => dndTargetData,
      }),
      monitorForElements({
        canMonitor: ({ source }) => {
          // TS cannot infer `dndTargetData` but we've just checked it.
          // TODO(psyche): Figure out how to satisfy TS.
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const arg = { sourceData: source.data, targetData: dndTargetData, dispatch, getState } as any;
          return dndTarget.isValid(arg);
        },
        onDragStart: () => {
          setDndOrigin('element');
          setDndState('potential');
        },
        onDrop: () => {
          setDndOrigin(null);
          setDndState('idle');
        },
      })
    );
  }, [dispatch, isDisabled, dndTarget, dndTargetData]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    if (isDisabled) {
      return;
    }

    return combine(
      dropTargetForExternal({
        element,
        canDrop: (args) => {
          if (!containsFiles(args)) {
            return false;
          }
          return true;
        },
        onDragEnter: () => {
          setDndState('over');
        },
        onDragLeave: () => {
          setDndState('potential');
        },
        onDrop: async ({ source }) => {
          const files = await getFiles({ source });
          for (const file of files) {
            if (file === null) {
              continue;
            }
            if (!zUploadFile.safeParse(file).success) {
              continue;
            }
            const imageDTO = await uploadImage({
              type: 'file',
              file: file,
              image_category: 'user',
              is_intermediate: false,
            });
          }
        },
      }),
      monitorForExternal({
        canMonitor: (args) => {
          if (!containsFiles(args)) {
            return false;
          }
          return true;
        },
        onDragStart: () => {
          setDndOrigin('external');
          setDndState('potential');
          preventUnhandled.start();
        },
        onDrop: () => {
          setDndOrigin(null);
          setDndState('idle');
          preventUnhandled.stop();
        },
      })
    );
  }, [dispatch, isDisabled]);

  return (
    <Box ref={ref} sx={sx} data-dnd-state={dndState}>
      <DndDropOverlay
        dndState={dndState}
        label={dndOrigin === 'element' ? label : dndOrigin === 'external' ? externalLabel : undefined}
      />
    </Box>
  );
});

DndDropTarget.displayName = 'DndDropTarget';
