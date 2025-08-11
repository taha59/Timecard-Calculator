import React, { useState } from 'react';
import { Clock, Edit2, Save, X, User, Calendar, Plus, Minus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { SidePanelImageViewer } from '@/components/SidePanelImageViewer';

interface TimecardDay {
  day: string;
  time_in: string;
  time_out: string;
  hours_worked?: string;
}

interface Timecard {
  name: string;
  days: TimecardDay[];
  total_hours_worked: string;
}

interface TimecardDisplayProps {
  timecards: Timecard[];
  onEdit: (cardIndex: number, updatedDays: TimecardDay[]) => void;
  processedImageUrl?: string;
}

export function TimecardDisplay({ timecards, onEdit, processedImageUrl }: TimecardDisplayProps) {
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editedDays, setEditedDays] = useState<TimecardDay[]>([]);
  const [showImagePanel, setShowImagePanel] = useState(false);

  const startEditing = (cardIndex: number) => {
    setEditingCard(cardIndex);
    setEditedDays([...timecards[cardIndex].days]);
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setEditedDays([]);
  };

  const saveEditing = () => {
    if (editingCard !== null) {
      onEdit(editingCard, editedDays);
      setEditingCard(null);
      setEditedDays([]);
    }
  };

  const updateDay = (dayIndex: number, field: keyof TimecardDay, value: string) => {
    const updated = [...editedDays];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setEditedDays(updated);
  };

  const addTimeEntry = () => {
    if (editedDays.length >= 7) return; // Max 7 days per week
    
    const newDay: TimecardDay = {
      day: `${editedDays.length + 1}${getOrdinalSuffix(editedDays.length + 1)} Day`,
      time_in: '',
      time_out: '',
      hours_worked: ''
    };
    
    setEditedDays([...editedDays, newDay]);
  };

  const removeTimeEntry = (dayIndex: number) => {
    if (editedDays.length <= 1) return; // Keep at least one entry
    
    const updated = editedDays.filter((_, index) => index !== dayIndex);
    // Renumber the remaining days
    const renumbered = updated.map((day, index) => ({
      ...day,
      day: `${index + 1}${getOrdinalSuffix(index + 1)} Day`
    }));
    
    setEditedDays(renumbered);
  };

  const getOrdinalSuffix = (num: number): string => {
    if (num >= 11 && num <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  if (timecards.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-200px)] gap-0">
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:pr-4">
        <div className="space-y-4 md:space-y-6">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                  Extracted Timecards
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  Review and edit your timecard data below
                </p>
              </div>
              
              {processedImageUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowImagePanel(!showImagePanel)}
                  className="flex items-center gap-2 mx-auto md:mx-0 h-8 md:h-9"
                  size="sm"
                >
                  <Image className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">
                    {showImagePanel ? 'Hide' : 'Show'} Image Reference
                  </span>
                  <span className="sm:hidden">
                    {showImagePanel ? 'Hide' : 'Show'} Image
                  </span>
                </Button>
              )}
            </div>
          </div>

          <Accordion type="single" collapsible defaultValue={`timecard-0`} className="w-full space-y-4">
            {timecards.map((timecard, cardIndex) => (
              <AccordionItem key={cardIndex} value={`timecard-${cardIndex}`} className="border rounded-lg">
                <AccordionTrigger className="px-3 md:px-6 py-3 md:py-4 hover:no-underline">
                  <div className="flex flex-col gap-2 w-full mr-2 md:mr-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      <span className="text-base md:text-lg font-semibold truncate">{timecard.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 md:gap-3">
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Total: {timecard.total_hours_worked}
                      </Badge>
                      
                      {editingCard === cardIndex ? (
                        <div className="flex gap-1 md:gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            onClick={saveEditing}
                            className="btn-success h-7 w-7 md:h-8 md:w-8 p-0"
                          >
                            <Save className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditing}
                            className="h-7 w-7 md:h-8 md:w-8 p-0"
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(cardIndex);
                          }}
                          className="h-7 w-7 md:h-8 md:w-8 p-0"
                        >
                          <Edit2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-3 md:px-6 pb-4 md:pb-6">
                  <div className="space-y-2 md:space-y-3">
                    {(editingCard === cardIndex ? editedDays : timecard.days).map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="flex flex-col gap-2 p-2 md:p-3 rounded-lg bg-muted/30 border"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs md:text-sm font-medium">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                            {editingCard === cardIndex ? (
                              <Input
                                value={day.day}
                                onChange={(e) => updateDay(dayIndex, 'day', e.target.value)}
                                className="h-5 md:h-6 text-xs md:text-sm font-medium border-0 bg-transparent p-0 focus-visible:ring-0"
                              />
                            ) : (
                              <span className="truncate">{day.day}</span>
                            )}
                          </div>
                          
                          {editingCard === cardIndex && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeTimeEntry(dayIndex)}
                              disabled={editedDays.length <= 1}
                              className="h-5 w-5 md:h-6 md:w-6 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            >
                              <Minus className="h-2 w-2 md:h-3 md:w-3" />
                            </Button>
                          )}
                        </div>

                        {editingCard === cardIndex ? (
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Time In</label>
                              <Input
                                value={day.time_in}
                                onChange={(e) => updateDay(dayIndex, 'time_in', e.target.value)}
                                placeholder="09:00 AM"
                                className="h-7 md:h-8 text-xs md:text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Time Out</label>
                              <Input
                                value={day.time_out}
                                onChange={(e) => updateDay(dayIndex, 'time_out', e.target.value)}
                                placeholder="05:00 PM"
                                className="h-7 md:h-8 text-xs md:text-sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 text-xs md:text-sm">
                            <div>
                              <span className="text-muted-foreground block text-xs">In</span>
                              <span className="font-medium truncate">{day.time_in}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Out</span>
                              <span className="font-medium truncate">{day.time_out}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Hours</span>
                              <span className="font-medium text-primary truncate">{day.hours_worked}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Time Entry Button - Only show when editing */}
                    {editingCard === cardIndex && (
                      <Button
                        variant="outline"
                        onClick={addTimeEntry}
                        disabled={editedDays.length >= 7}
                        className="w-full h-12 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Entry ({editedDays.length}/7)
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Side Panel Image Viewer */}
      {processedImageUrl && (
        <SidePanelImageViewer
          imageUrl={processedImageUrl}
          alt="Processed timecard image"
          isOpen={showImagePanel}
          onToggle={() => setShowImagePanel(!showImagePanel)}
        />
      )}
    </div>
  );
}