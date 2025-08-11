import { useState, useCallback } from 'react';

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

interface ApiError {
  error: string;
  raw_response?: string;
}

export function useTimecardApi() {
  const [timecards, setTimecards] = useState<Timecard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const uploadTimecard = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload_timecard`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if ('error' in data) {
        throw new Error(data.error);
      }

      setTimecards(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editTimecard = useCallback(async (cardIndex: number, updatedDays: TimecardDay[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/edit_timecard`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDays),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update the specific timecard with the new data
      setTimecards(prev => {
        const updated = [...prev];
        updated[cardIndex] = {
          ...updated[cardIndex],
          days: data.entries,
          total_hours_worked: data.total_hours_worked
        };
        return updated;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Edit error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearTimecards = useCallback(() => {
    setTimecards([]);
    setError(null);
  }, []);

  return {
    timecards,
    isLoading,
    error,
    uploadTimecard,
    editTimecard,
    clearTimecards
  };
}