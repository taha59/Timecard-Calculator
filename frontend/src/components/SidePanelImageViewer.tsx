import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Move, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidePanelImageViewerProps {
  imageUrl: string;
  alt?: string;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function SidePanelImageViewer({ 
  imageUrl, 
  alt = "Processed timecard image", 
  isOpen, 
  onToggle,
  className 
}: SidePanelImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.3, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.3, 0.3));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleFitToWidth = () => {
    setScale(0.8);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.3, Math.min(4, prev * delta)));
  };

  return (
    <div className={cn(
      "flex flex-col bg-background transition-all duration-300",
      "lg:border-l lg:border-border lg:h-full",
      "border-t border-border lg:border-t-0",
      isOpen ? "lg:w-96 h-96 lg:h-full" : "lg:w-12 h-12 lg:h-full",
      !isOpen && "lg:flex hidden", // Hide completely on mobile when closed
      className
    )}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 lg:h-8 lg:w-8 p-0"
          title={isOpen ? "Hide image" : "Show image"}
        >
          {isOpen ? (
            <X className="h-3 w-3 lg:h-4 lg:w-4" />
          ) : (
            <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
          )}
        </Button>
        
        {isOpen && (
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 lg:px-2">
              {Math.round(scale * 100)}%
            </Badge>
          </div>
        )}
      </div>

      {isOpen && (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1.5 lg:p-2 border-b border-border bg-muted/10">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.3} className="h-6 px-1.5 lg:h-7 lg:px-2">
              <ZoomOut className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 4} className="h-6 px-1.5 lg:h-7 lg:px-2">
              <ZoomIn className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate} className="h-6 px-1.5 lg:h-7 lg:px-2">
              <RotateCw className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFitToWidth} className="h-6 px-1.5 lg:h-7 lg:px-2 text-xs">
              <span className="hidden lg:inline">Fit</span>
              <span className="lg:hidden">F</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="h-6 px-1.5 lg:h-7 lg:px-2 text-xs">
              <span className="hidden lg:inline">Reset</span>
              <span className="lg:hidden">R</span>
            </Button>
          </div>

          {/* Image Container */}
          <div 
            className="flex-1 overflow-hidden bg-muted/20 relative"
            onWheel={handleWheel}
          >
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center'
                }}
                draggable={false}
              />
              
              {scale > 1 && (
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Drag
                </div>
              )}
            </div>
          </div>

          {/* Image Info */}
          <div className="p-2 border-t border-border bg-muted/10">
            <p className="text-xs text-muted-foreground text-center">
              Cross-reference with editing
            </p>
          </div>
        </>
      )}
    </div>
  );
}