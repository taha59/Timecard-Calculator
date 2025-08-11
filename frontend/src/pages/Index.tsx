import React, { useState } from 'react';
import { Calculator, Clock, Users, RotateCcw } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ImagePreview } from '@/components/ImagePreview';
import { TimecardDisplay } from '@/components/TimecardDisplay';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useTimecardApi } from '@/hooks/useTimecardApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type AppState = 'upload' | 'preview' | 'processing' | 'results';

const Index = () => {
  const { timecards, isLoading, error, uploadTimecard, editTimecard, clearTimecards } = useTimecardApi();
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCurrentState('preview');
  };

  const handleProcessImage = (rotatedFile: File) => {
    setCurrentState('processing');
    // Create URL for the processed (rotated) image to use in results
    const processedUrl = URL.createObjectURL(rotatedFile);
    setProcessedImageUrl(processedUrl);
    uploadTimecard(rotatedFile);
  };

  const handleBackToUpload = () => {
    setSelectedFile(null);
    setCurrentState('upload');
  };

  const handleRetry = () => {
    clearTimecards();
    setCurrentState('upload');
    setSelectedFile(null);
    // Clean up the processed image URL
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
      setProcessedImageUrl(null);
    }
  };

  const handleNewUpload = () => {
    clearTimecards();
    setCurrentState('upload');
    setSelectedFile(null);
    // Clean up the processed image URL
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
      setProcessedImageUrl(null);
    }
  };

  // Update state based on API responses
  React.useEffect(() => {
    if (timecards.length > 0) {
      setCurrentState('results');
    }
  }, [timecards]);

  React.useEffect(() => {
    if (error && currentState === 'processing') {
      setCurrentState('results');
    }
  }, [error, currentState]);

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Calculator className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Timecard Calculator
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  AI-powered timecard extraction and calculation
                </p>
              </div>
            </div>

            {timecards.length > 0 && (
              <div className="flex items-center justify-between gap-3 md:gap-4">
                <Badge variant="secondary" className="flex items-center gap-2 text-xs">
                  <Users className="h-3 w-3" />
                  {timecards.length} timecard{timecards.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="outline"
                  onClick={handleNewUpload}
                  size="sm"
                  className="flex items-center gap-2 h-8 md:h-9"
                >
                  <RotateCcw className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">New Upload</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Features Banner */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Transform Your Timecard Processing
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload timecard images and let our AI automatically extract and calculate 
            working hours with precision and speed.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Instant Processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 rounded-full bg-primary/10">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Automatic Calculations</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Multiple Timecards</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {currentState === 'upload' && (
          <div className="max-w-3xl mx-auto mb-12">
            <FileUpload 
              onFileSelect={handleFileSelect} 
              isLoading={false}
            />
          </div>
        )}

        {/* Image Preview Section */}
        {currentState === 'preview' && selectedFile && (
          <div className="max-w-4xl mx-auto mb-12">
            <ImagePreview
              file={selectedFile}
              onProcessImage={handleProcessImage}
              onBack={handleBackToUpload}
              isProcessing={false}
            />
          </div>
        )}

        {/* Processing State */}
        {currentState === 'processing' && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="text-center p-12 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="loading-spinner h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Processing your timecard...
              </h3>
              <p className="text-sm text-muted-foreground">
                Our AI is extracting timecard data from your rotated image
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Timecards Display */}
        {currentState === 'results' && timecards.length > 0 && (
          <TimecardDisplay 
            timecards={timecards} 
            onEdit={editTimecard}
            processedImageUrl={processedImageUrl || undefined}
          />
        )}

        {/* Instructions */}
        {currentState === 'upload' && (
          <div className="max-w-4xl mx-auto mt-16">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              How It Works
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Upload Image</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a clear image of your timecard(s) in JPG, PNG, or WebP format
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">AI Processing</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI extracts names, dates, and time entries automatically
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold text-foreground mb-2">Review & Edit</h4>
                <p className="text-sm text-muted-foreground">
                  Review results and make any necessary edits with real-time calculations
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Powered by AI • Built with React & Flask</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
