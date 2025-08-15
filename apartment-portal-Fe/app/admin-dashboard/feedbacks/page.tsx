"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { feedbacksApi, Feedback, FeedbackStatus } from '@/lib/api';

export default function FeedbacksPage() {
  const { t, language } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await feedbacksApi.getAll();
        setFeedbacks(data);
      } catch (err: any) {
        setError(err.message || t('admin.feedbacks.loadError','Lỗi khi tải phản hồi'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = (feedback.residentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (feedback.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (feedback.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || feedback.rating === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  const updateStatus = async (id: number, status: FeedbackStatus) => {
    try {
      setUpdatingId(id);
      const updated = await feedbacksApi.updateStatus(id, status);
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: updated.status, updatedAt: updated.updatedAt } : f));
    } catch (e) {
      setError((e as any)?.message || t('admin.feedbacks.updateStatusError','Cập nhật trạng thái thất bại'));
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'RESPONDED':
        return <Badge className="bg-green-100 text-green-800">Đã phản hồi</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.feedbacks.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.feedbacks.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.feedbacks.list')}
            </h2>
            <p className="text-gray-600">
              {t('admin.feedbacks.listDesc','Quản lý tất cả phản hồi từ cư dân')}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.feedbacks.searchPlaceholder','Tìm kiếm theo cư dân, tiêu đề, nội dung...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  title={t('admin.action.filter','Lọc')}
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{t('admin.feedbacks.filter.rating.all','Tất cả đánh giá')}</option>
                  <option value="5">{t('admin.feedbacks.filter.rating.5','5 sao')}</option>
                  <option value="4">{t('admin.feedbacks.filter.rating.4','4 sao')}</option>
                  <option value="3">{t('admin.feedbacks.filter.rating.3','3 sao')}</option>
                  <option value="2">{t('admin.feedbacks.filter.rating.2','2 sao')}</option>
                  <option value="1">{t('admin.feedbacks.filter.rating.1','1 sao')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.feedbacks.list','Danh sách phản hồi')} ({filteredFeedbacks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.feedbacks.resident')}</TableHead>
                      <TableHead>{t('admin.feedbacks.subject')}</TableHead>
                      <TableHead>{t('admin.feedbacks.createdAt')}</TableHead>
                      <TableHead>{t('admin.feedbacks.type','Loại phản hồi')}</TableHead>
                      <TableHead>{t('admin.feedbacks.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.map((fb) => (
                      <TableRow key={fb.id}>
                        <TableCell>
                          {fb.residentName || (fb as any).resident_name || fb.username || (fb as any).userName || (fb.userId ? `User #${fb.userId}` : 'Ẩn danh')}
                        </TableCell>
                        <TableCell>{fb.content || <span className="italic text-gray-400">(Không có)</span>}</TableCell>
                        <TableCell>{new Date(fb.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</TableCell>
                        <TableCell>
                          {(() => {
                            const codeRaw = (fb.categoryCode || '').toString().toUpperCase().trim();
                            let code = codeRaw;
                            if (!code && fb.categoryName) {
                              const n = fb.categoryName.toString().trim().toLowerCase();
                              const byName: Record<string, string> = {
                                'dịch vụ chung': 'GENERAL_SERVICE',
                                'an ninh': 'SECURITY',
                                'vệ sinh': 'CLEANING',
                                'tiện ích': 'FACILITY',
                                'quản lý': 'MANAGEMENT',
                                'góp ý': 'SUGGESTION',
                                'khen ngợi': 'COMPLIMENT',
                                'phàn nàn': 'COMPLAINT',
                              };
                              code = byName[n] || '';
                            }
                            const nameMap: Record<string, string> = {
                              SUGGESTION: t('admin.feedbacks.category.SUGGESTION','Góp ý'),
                              COMPLIMENT: t('admin.feedbacks.category.COMPLIMENT','Khen ngợi'),
                              COMPLAINT: t('admin.feedbacks.category.COMPLAINT','Phàn nàn'),
                              GENERAL_SERVICE: t('admin.feedbacks.category.GENERAL_SERVICE','Dịch vụ chung'),
                              SECURITY: t('admin.feedbacks.category.SECURITY','An ninh'),
                              CLEANING: t('admin.feedbacks.category.CLEANING','Vệ sinh'),
                              FACILITY: t('admin.feedbacks.category.FACILITY','Tiện ích'),
                              MANAGEMENT: t('admin.feedbacks.category.MANAGEMENT','Quản lý'),
                            };
                            const text = nameMap[code] || (fb.categoryName ?? code ?? '-');
                            const style =
                              code === 'COMPLAINT'
                                ? { background: '#fee2e2', color: '#b91c1c' }
                                : code === 'COMPLIMENT'
                                ? { background: '#dcfce7', color: '#166534' }
                                : code === 'SUGGESTION'
                                ? { background: '#dbeafe', color: '#1e40af' }
                                : { background: '#f3f4f6', color: '#374151' };
                            return <Badge style={style}>{text}</Badge>;
                          })()}
                        </TableCell>
                        <TableCell>
                          {fb.status === 'RESPONDED' ? (
                            <Badge className="bg-green-100 text-green-800 select-none">{t('admin.feedbacks.status.RESPONDED','Đã phản hồi')}</Badge>
                          ) : (
                            <Badge
                              role="button"
                              title={t('admin.feedbacks.updateStatus.hint','Nhấn để đánh dấu đã xem')}
                              onClick={() => (updatingId ? null : updateStatus(fb.id, 'RESPONDED'))}
                              className={`bg-yellow-100 text-yellow-800 ${updatingId===fb.id ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:opacity-80'}`}
                            >
                              {updatingId===fb.id ? t('admin.feedbacks.updateStatus.loading','Đang cập nhật...') : t('admin.feedbacks.status.PENDING','Chưa xem')}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 