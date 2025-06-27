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

interface Feedback {
  id: string;
  residentName: string;
  subject: string;
  content: string;
  rating: number;
  createdAt: string;
  status: string;
}

export default function FeedbacksPage() {
  const { t } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockFeedbacks: Feedback[] = [
      {
        id: '1',
        residentName: 'Nguyễn Văn A',
        subject: 'Phản hồi về dịch vụ bảo trì',
        content: 'Dịch vụ bảo trì rất tốt, nhân viên thân thiện...',
        rating: 5,
        createdAt: '2024-01-15T10:30:00',
        status: 'READ'
      },
      {
        id: '2',
        residentName: 'Trần Thị B',
        subject: 'Góp ý về tiện ích',
        content: 'Cần cải thiện thêm một số tiện ích...',
        rating: 3,
        createdAt: '2024-01-20T14:15:00',
        status: 'UNREAD'
      },
      {
        id: '3',
        residentName: 'Lê Văn C',
        subject: 'Đánh giá chung về chung cư',
        content: 'Chung cư rất sạch sẽ và an toàn...',
        rating: 4,
        createdAt: '2024-01-25T09:45:00',
        status: 'READ'
      }
    ];

    setTimeout(() => {
      setFeedbacks(mockFeedbacks);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || feedback.rating === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READ':
        return <Badge className="bg-green-100 text-green-800">Đã đọc</Badge>;
      case 'UNREAD':
        return <Badge className="bg-red-100 text-red-800">Chưa đọc</Badge>;
      case 'REPLIED':
        return <Badge className="bg-blue-100 text-blue-800">Đã trả lời</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
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
              Quản lý tất cả phản hồi từ cư dân
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
                  placeholder="Tìm kiếm theo cư dân, tiêu đề, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách phản hồi ({filteredFeedbacks.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFeedbacks.length === 0 ? (
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
                      <TableHead>{t('admin.feedbacks.rating')}</TableHead>
                      <TableHead>{t('admin.feedbacks.createdAt')}</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>{t('admin.users.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id}>
                        <TableCell className="font-medium">
                          {feedback.residentName}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {feedback.subject}
                        </TableCell>
                        <TableCell>
                          {renderStars(feedback.rating)}
                        </TableCell>
                        <TableCell>
                          {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin-dashboard/feedbacks/${feedback.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/feedbacks/edit/${feedback.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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