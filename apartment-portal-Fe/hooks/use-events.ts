import { useState, useEffect } from 'react';
import { 
  eventsApi, 
  Event, 
  EventCreateRequest, 
  EventUpdateRequest 
} from '@/lib/api';

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (data: EventCreateRequest) => Promise<void>;
  updateEvent: (id: number, data: EventUpdateRequest) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  fetchEvents: () => Promise<void>;
}

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: EventCreateRequest) => {
    setError(null);
    try {
      const newEvent = await eventsApi.create(data);
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      setError('Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (id: number, data: EventUpdateRequest) => {
    setError(null);
    try {
      await eventsApi.update(id, data);
      setEvents(prev => 
        prev.map(event => 
          event.id === id 
            ? { ...event, ...data }
            : event
        )
      );
    } catch (err) {
      setError('Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id: number) => {
    setError(null);
    try {
      await eventsApi.delete(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError('Failed to delete event');
      throw err;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
  };
}; 