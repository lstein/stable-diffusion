import React, { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createSelector } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { RootState, useAppSelector } from "../../../app/store";
import { OptionsState } from "../../options/optionsSlice";
import { tabMap } from "../../tabs/InvokeTabs";

import InvokeAI from "../../../app/invokeai";
import drawBrush from "../../tabs/Inpainting/drawBrush";

interface Point {
  x: number;
  y: number;
}

export interface CanvasElementProps {
  setOnDraw?: (onDraw: (ctx: CanvasRenderingContext2D) => void) => void;
  unsetOnDraw?: () => void;
}

interface PaintingCanvasProps {
  children?: React.ReactNode;
  setOnBrushClear: (onBrushClear: () => void) => void;
}

export let canvasRef: MutableRefObject<HTMLCanvasElement | null>;
export let canvasContext: MutableRefObject<CanvasRenderingContext2D | null>;

export let maskCanvasRef: MutableRefObject<HTMLCanvasElement | null>;
export let maskCanvasContext: MutableRefObject<CanvasRenderingContext2D | null>;

const paintingOptionsSelector = createSelector(
  (state: RootState) => state.options,
  (options: OptionsState) => {
    return {
      tool: options.inpaintingTool,
      brushSize: options.inpaintingBrushSize,
      brushShape: options.inpaintingBrushShape,
      // this seems to be a reasonable calculation to get a good brush stamp pixel distance
      brushIncrement: Math.floor(
        Math.min(Math.max(options.inpaintingBrushSize / 8, 1), 5)
      ),
      activeTab: tabMap[options.activeTab],
      shouldShowGallery: options.shouldShowGallery,
    };
  },
  {
    memoizeOptions: {
      resultEqualityCheck: isEqual,
    },
  }
);

const PaintingCanvas = (props: PaintingCanvasProps) => {
  const { children, setOnBrushClear } = props;
  const { shouldShowGallery, activeTab, inpaintingTool, inpaintingBrushSize, inpaintingBrushShape } = useAppSelector(
    (state: RootState) => state.options
  );

  canvasRef = useRef<HTMLCanvasElement>(null);
  canvasContext = useRef<CanvasRenderingContext2D>(null);
  maskCanvasRef = useRef<HTMLCanvasElement>(null);
  maskCanvasContext = useRef<CanvasRenderingContext2D>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // holds the requestAnimationFrame() ID value so we can cancel requests on component unmount
  const animationFrameID = useRef<number>(0);
  const childrenOnDraw = useRef<Map<React.ReactElement, (ctx: CanvasRenderingContext2D) => void>>(new Map());

  const [cameraOffset, setCameraOffset] = useState<Point>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<Point>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [effectTrigger, setEffectTrigger] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(true);

  const applyTransform = (x: number, y: number) => {
    if (!wrapperRef.current)
      return { x, y }

    return {
      x: (x - wrapperRef.current.offsetWidth / 2.0) / zoomLevel - cameraOffset.x + wrapperRef.current.offsetWidth / 2.0,
      y: (y - wrapperRef.current.offsetHeight / 2.0) / zoomLevel - cameraOffset.y + wrapperRef.current.offsetHeight / 2.0,
    }
  }

  useEffect(() => {
    if (!canvasContext.current && canvasRef.current)
      canvasContext.current = canvasRef.current.getContext("2d");

    if (!maskCanvasRef.current)
      maskCanvasRef.current = document.createElement("canvas");

    if (!maskCanvasContext.current && maskCanvasRef.current)
      maskCanvasContext.current = maskCanvasRef.current.getContext("2d");

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(prefersDarkScheme.matches);
  }, [maskCanvasRef, canvasRef.current]);

  useEffect(() => {
    if (!maskCanvasRef.current || !maskCanvasContext.current)
      return;

    setOnBrushClear(() => {
      return () => {
        maskCanvasContext.current!.clearRect(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height);
        setEffectTrigger(!effectTrigger);
      }
    });
  }, [maskCanvasRef, maskCanvasRef, setOnBrushClear, setEffectTrigger]);

  useEffect(() => {
    if (!maskCanvasRef.current) return;

    maskCanvasRef.current.width = 2048;
    maskCanvasRef.current.height = 2048;
  }, [maskCanvasRef, wrapperRef.current, shouldShowGallery, canvasRef.current]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX / zoomLevel - cameraOffset.x, y: e.clientY / zoomLevel - cameraOffset.y });
    }
    if (e.button === 0) {
      if (
        !maskCanvasRef.current ||
        !maskCanvasContext.current ||
        !wrapperRef.current
      ) return;

      setIsDrawing(true);

      maskCanvasContext.current.fillStyle = "rgba(0, 0, 0, 1)";
      // maskCanvasContext.current.fillStyle = "#000000";

      if (inpaintingTool === "eraser") {
        maskCanvasContext.current.globalCompositeOperation = "destination-out";
      }
      else {
        maskCanvasContext.current.globalCompositeOperation = "source-over";
      }

      const { x, y } = applyTransform(e.clientX - wrapperRef.current.offsetLeft, e.clientY - wrapperRef.current.offsetTop);
      if (inpaintingBrushShape === "circle") {
        maskCanvasContext.current.moveTo(x, y);
        maskCanvasContext.current.arc(x, y, inpaintingBrushSize / 2, 0, 2 * Math.PI, true);
        maskCanvasContext.current.fill();
      }
      else if (inpaintingBrushShape === "square") {
        maskCanvasContext.current.fillRect(x - inpaintingBrushSize / 2, y - inpaintingBrushSize / 2, inpaintingBrushSize, inpaintingBrushSize);
      }

      setEffectTrigger(!effectTrigger);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (e.button === 1) {
      setIsDragging(false);
    }
    if (e.button === 0) {
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!wrapperRef.current) return;

    if (isDragging) {
      setCameraOffset({
        x: e.clientX / zoomLevel - dragStart.x,
        y: e.clientY / zoomLevel - dragStart.y,
      });
    }

    if (!maskCanvasRef) return;

    if (isDrawing && maskCanvasContext.current) {
      const { x, y } = applyTransform(e.clientX - wrapperRef.current.offsetLeft, e.clientY - wrapperRef.current.offsetTop);

      if (inpaintingBrushShape === "circle") {
        maskCanvasContext.current.moveTo(x, y);
        maskCanvasContext.current.arc(x, y, inpaintingBrushSize / 2, 0, 2 * Math.PI, true);
        maskCanvasContext.current.fill();
      }
      else if (inpaintingBrushShape === "square") {
        maskCanvasContext.current.fillRect(x - inpaintingBrushSize / 2, y - inpaintingBrushSize / 2, inpaintingBrushSize, inpaintingBrushSize);
      }

      setEffectTrigger(!effectTrigger);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (isDragging)
      return;

    const zoomFactor = 1.1;
    const newZoomLevel = e.deltaY < 0 ? zoomLevel * zoomFactor : zoomLevel / zoomFactor;

    setZoomLevel(newZoomLevel);
  };

  const draw = () => {
    if (
      !canvasRef.current ||
      !canvasContext.current ||
      !maskCanvasRef.current ||
      !wrapperRef.current
    ) return;

    const { width, height } = wrapperRef.current.getBoundingClientRect();

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    canvasContext.current.translate(width / 2, height / 2);
    canvasContext.current.scale(zoomLevel, zoomLevel);
    canvasContext.current.translate(-width / 2 + cameraOffset.x, -height / 2 + cameraOffset.y);
    canvasContext.current.clearRect(0, 0, width, height);

    canvasContext.current.globalCompositeOperation = "source-over";
    childrenOnDraw.current.forEach((onDraw) => {
      onDraw(canvasContext.current!);
    });

    canvasContext.current.globalCompositeOperation = "destination-out";
    canvasContext.current.drawImage(maskCanvasRef.current, 0, 0);
  }

  useLayoutEffect(() => {
    draw();

    animationFrameID.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameID.current);
  }, [cameraOffset, zoomLevel, shouldShowGallery, effectTrigger]);

  return (
    <div className="painting-canvas" ref={wrapperRef}>
      <canvas className="main-canvas"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
      />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement<CanvasElementProps>(child as React.FunctionComponentElement<CanvasElementProps>, {
            setOnDraw: (onDraw: (ctx: CanvasRenderingContext2D) => void) => {
              childrenOnDraw.current.set(child, (ctx) => {
                onDraw(ctx);
                setEffectTrigger(!effectTrigger);
              });

              setEffectTrigger(!effectTrigger);
            },
            unsetOnDraw: () => {
              childrenOnDraw.current.delete(child);
            }
          });
        }
        return null;
      })}
    </div>
  )
}

export default PaintingCanvas;