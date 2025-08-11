import React, { useState, useEffect } from 'react';
import { RotateCw, RotateCcw, Send, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  rotateImage, 
  getNextRotation, 
  getPreviousRotation, 
  createImagePreviewUrl,
  type RotationDegrees 
} from '@/utils/imageRotation';

interface ImagePreviewProps {
  file: File;
  onProcessImage: (rotatedFile: File) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export function ImagePreview({ file, onProcessImage, onBack, isProcessing = false }: ImagePreviewProps) {
  const [rotation, setRotation] = useState<RotationDegrees>(0);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const url = createImagePreviewUrl(file);
    setImageUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleRotateClockwise = () => {
    if (isRotating || isProcessing) return;
    setRotation(getNextRotation(rotation));
  };

  const handleRotateCounterClockwise = () => {
    if (isRotating || isProcessing) return;
    setRotation(getPreviousRotation(rotation));
  };

  const handleProcessImage = async () => {
    if (isRotating || isProcessing) return;
    
    try {
      setIsRotating(true);
      const rotatedFile = await rotateImage(file, rotation);
      onProcessImage(rotatedFile);
    } catch (error) {
      console.error('Error rotating image:', error);
    } finally {
      setIsRotating(false);
    }
  };

  const getRotationTransform = (degrees: RotationDegrees) => {
    return `rotate(${degrees}deg)`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Review & Rotate Image
          </h3>
          <p className="text-sm text-muted-foreground">
            Rotate the image until the timecards are properly oriented for best AI processing results
          </p>
        </div>

        {/* Image Preview */}
        <div className="relative mb-6">
          <div className="flex justify-center items-center min-h-[400px] bg-muted/20 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Timecard preview"
              className={cn(
                "max-w-full max-h-[400px] object-contain transition-transform duration-300 ease-in-out",
                isRotating && "opacity-50"
              )}
              style={{
                transform: getRotationTransform(rotation)
              }}
            />
            
            {isRotating && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Rotation Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Rotate:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateCounterClockwise}
              disabled={isRotating || isProcessing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              90° Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotateClockwise}
              disabled={isRotating || isProcessing}
              className="flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4" />
              90° Right
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isRotating || isProcessing}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Change Image
            </Button>
            
            <Button
              onClick={handleProcessImage}
              disabled={isRotating || isProcessing}
              className="btn-gradient flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Process Timecard
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Current Rotation Indicator */}
        <div className="text-center mt-4">
          <span className="text-xs text-muted-foreground">
            Current rotation: {rotation}°
          </span>
        </div>
      </Card>
    </div>
  );
}