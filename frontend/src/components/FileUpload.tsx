import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  className?: string;
}

export function FileUpload({ onFileSelect, isLoading = false, className }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    disabled: isLoading
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "upload-zone",
        "relative flex flex-col items-center justify-center min-h-[300px] rounded-xl cursor-pointer",
        "bg-card/50 backdrop-blur-sm",
        isDragActive && "dragover",
        isLoading && "pointer-events-none opacity-50",
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center text-center p-8">
        {isLoading ? (
          <>
            <Loader2 className="loading-spinner h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processing your timecard...
            </h3>
            <p className="text-sm text-muted-foreground">
              Our AI is extracting timecard data from your image
            </p>
          </>
        ) : (
          <>
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              {isDragActive ? (
                <FileImage className="h-8 w-8 text-primary" />
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? 'Drop your timecard here' : 'Upload timecard image'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Drag and drop your timecard image here, or click to select a file. 
              Supports JPG, PNG, and WebP formats.
            </p>
            
            <Button className="btn-gradient">
              Select File
            </Button>
          </>
        )}
      </div>
    </div>
  );
}