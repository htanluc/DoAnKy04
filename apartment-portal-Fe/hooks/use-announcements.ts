import { useState, useEffect } from 'react';
import { 
  announcementsApi, 
  Announcement, 
  AnnouncementCreateRequest, 
  AnnouncementUpdateRequest 
} from '@/lib/api';

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  createAnnouncement: (data: AnnouncementCreateRequest) => Promise<void>;
  updateAnnouncement: (id: number, data: AnnouncementUpdateRequest) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
}

export const useAnnouncements = (): UseAnnouncementsReturn => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementsApi.getAll();
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to fetch announcements');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (data: AnnouncementCreateRequest) => {
    setError(null);
    try {
      const newAnnouncement = await announcementsApi.create(data);
      setAnnouncements(prev => [...prev, newAnnouncement]);
    } catch (err) {
      setError('Failed to create announcement');
      throw err;
    }
  };

  const updateAnnouncement = async (id: number, data: AnnouncementUpdateRequest) => {
    setError(null);
    try {
      await announcementsApi.update(id, data);
      setAnnouncements(prev => 
        prev.map(announcement => 
          announcement.id === id 
            ? { ...announcement, ...data }
            : announcement
        )
      );
    } catch (err) {
      setError('Failed to update announcement');
      throw err;
    }
  };

  const deleteAnnouncement = async (id: number) => {
    setError(null);
    try {
      await announcementsApi.delete(id);
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    } catch (err) {
      setError('Failed to delete announcement');
      throw err;
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAnnouncements,
  };
}; 