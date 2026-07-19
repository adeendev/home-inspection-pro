"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  width?: number;
  height?: number;
}

export function SignaturePad({
  value,
  onChange,
  className,
  width = 400,
  height = 160,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getPos = useCallback((e: React.PointerEvent<HTMLCanvasElement> | PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      setIsDrawing(true);
      lastPoint.current = getPos(e);
    },
    [getPos],
  );

  const draw = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx || !lastPoint.current) return;

      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#1a2236";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastPoint.current = pos;
      setHasDrawn(true);
    },
    [isDrawing, getPos],
  );

  const endDraw = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (canvas) canvas.releasePointerCapture(e.pointerId);
      setIsDrawing(false);
      lastPoint.current = null;
      if (hasDrawn) {
        const dataUrl = canvas?.toDataURL("image/png") ?? "";
        onChange(dataUrl);
      }
    },
    [isDrawing, hasDrawn, onChange],
  );

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange("");
  }, [onChange]);

  useEffect(() => {
    if (!value && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasDrawn(false);
    }
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
          className="block w-full touch-none cursor-crosshair"
          style={{ height: `${height}px` }}
        />
        {!value && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground/60 select-none">
            Sign here
          </span>
        )}
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-border bg-white/90 px-2 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur transition-colors hover:bg-secondary hover:text-ink"
        >
          <Eraser className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}
