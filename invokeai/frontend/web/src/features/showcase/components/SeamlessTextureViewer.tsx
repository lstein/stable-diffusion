import { Grid, Image } from '@invoke-ai/ui-library';
import { useFocusedMouseWheel } from 'features/showcase/hooks/useFocusedMouseWheel';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ImageDTO } from 'services/api/types';

type SeamlessTextureViewerProps = {
  imageDTO: ImageDTO;
};

export default function SeamlessTextureViewer(props: SeamlessTextureViewerProps) {
  const [tileCount, setTileCount] = useState(150);
  const [gridWidth, setGridWidth] = useState(256);
  const seamlessViewerRef = useRef<HTMLDivElement | null>(null);

  const tiles = Array.from({ length: tileCount }, (_, index) => index);

  const calculateTotalTiles = (gridWidth: number) => {
    const seamlessViewerElement = seamlessViewerRef.current;

    if (!seamlessViewerElement) {
      return 0;
    }

    const totalItems =
      Math.ceil(seamlessViewerElement.offsetWidth / gridWidth) *
      Math.ceil(seamlessViewerElement.offsetHeight / gridWidth);

    return totalItems;
  };

  useEffect(() => {
    const seamlessViewerElement = seamlessViewerRef.current;
    if (!seamlessViewerElement) {
      return;
    }

    const seamlessViewerObserver = new ResizeObserver(() => {
      const totalItems = calculateTotalTiles(gridWidth);
      setTileCount(totalItems);
    });

    seamlessViewerObserver.observe(seamlessViewerElement);

    return () => {
      seamlessViewerObserver.disconnect();
    };
  }, [gridWidth]);

  const handleScroll = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const zoomFactor = 0.25;

      const minGridWidth = 128;
      const maxGridWidth = props.imageDTO.width;
      const newGridWidth = Math.min(
        Math.max(gridWidth - Math.sign(delta) * zoomFactor * gridWidth, minGridWidth),
        maxGridWidth
      );

      const totalItems = calculateTotalTiles(newGridWidth);

      setGridWidth(newGridWidth);
      setTileCount(totalItems);
    },
    [gridWidth, props.imageDTO.width]
  );

  useFocusedMouseWheel(seamlessViewerRef, handleScroll);

  return (
    <Grid
      width="100%"
      templateColumns={`repeat(auto-fill, minmax(${gridWidth}px, 1fr))`}
      autoRows="max-content"
      position="relative"
      ref={seamlessViewerRef}
    >
      {tiles.map((tileIndex) => (
        <Image
          key={tileIndex}
          src={props.imageDTO.image_url}
          alt={`Tile ${tileIndex + 1}`}
          sx={{ width: '100%', height: 'auto', objectFit: 'cover' }}
        />
      ))}
    </Grid>
  );
}
