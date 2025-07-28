import { useState } from 'react';
import { feedbacksApi, Feedback, FeedbackCreateRequest, FeedbackStatus } from '@/lib/api';

export function useFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resident: gửi phản hồi
  const createFeedback = async (data: FeedbackCreateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbacksApi.create(data);
      setFeedback(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Gửi phản hồi thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resident: lấy danh sách phản hồi của mình
  const fetchMyFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbacksApi.getMy();
      setFeedbacks(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Lấy danh sách phản hồi thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: lấy tất cả phản hồi (có filter)
  const fetchAllFeedbacks = async (params?: { status?: string; category?: string; userId?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbacksApi.getAll(params);
      setFeedbacks(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Lấy danh sách phản hồi thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: lấy chi tiết phản hồi
  const fetchFeedbackById = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbacksApi.getById(id);
      setFeedback(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Lấy chi tiết phản hồi thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: cập nhật trạng thái phản hồi
  const updateFeedbackStatus = async (id: number, status: FeedbackStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbacksApi.updateStatus(id, status);
      setFeedback(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Cập nhật trạng thái thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin: trả lời phản hồi
  const responseFeedback = async (id: number, responseText: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await feedbacksApi.response(id, responseText);
      setFeedback(res);
      return res;
    } catch (err: any) {
      setError(err.message || 'Trả lời phản hồi thất bại');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    feedbacks,
    feedback,
    loading,
    error,
    createFeedback,
    fetchMyFeedbacks,
    fetchAllFeedbacks,
    fetchFeedbackById,
    updateFeedbackStatus,
    responseFeedback,
    setFeedbacks,
    setFeedback,
  };
} 