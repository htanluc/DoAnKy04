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
  Eye,
  Filter,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Link from 'next/link';

interface QARecord {
  id: string;
  user: string;
  question: string;
  answer: string;
  feedback: string;
  createdAt: string;
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const [qaRecords, setQaRecords] = useState<QARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeedback, setFilterFeedback] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockQARecords: QARecord[] = [
      {
        id: '1',
        user: 'Nguyễn Văn A',
        question: 'Làm thế nào để đăng ký sử dụng hồ bơi?',
        answer: 'Bạn có thể đăng ký sử dụng hồ bơi tại quầy dịch vụ tầng 1 hoặc qua ứng dụng...',
        feedback: 'POSITIVE',
        createdAt: '2024-01-15T10:30:00'
      },
      {
        id: '2',
        user: 'Trần Thị B',
        question: 'Giờ mở cửa của phòng gym là gì?',
        answer: 'Phòng gym mở cửa từ 5h sáng đến 23h tối hàng ngày...',
        feedback: 'NEGATIVE',
        createdAt: '2024-01-20T14:15:00'
      },
      {
        id: '3',
        user: 'Lê Văn C',
        question: 'Cách thanh toán hóa đơn điện nước?',
        answer: 'Bạn có thể thanh toán qua ứng dụng, tại quầy dịch vụ hoặc chuyển khoản...',
        feedback: 'POSITIVE',
        createdAt: '2024-01-25T09:45:00'
      }
    ];

    setTimeout(() => {
      setQaRecords(mockQARecords);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredQARecords = qaRecords.filter(record => {
    const matchesSearch = record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeedback = filterFeedback === 'all' || record.feedback === filterFeedback;
    return matchesSearch && matchesFeedback;
  });

  const getFeedbackBadge = (feedback: string) => {
    switch (feedback) {
      case 'POSITIVE':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center space-x-1">
            <ThumbsUp className="h-3 w-3" />
            <span>Tích cực</span>
          </Badge>
        );
      case 'NEGATIVE':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center space-x-1">
            <ThumbsDown className="h-3 w-3" />
            <span>Tiêu cực</span>
          </Badge>
        );
      case 'NEUTRAL':
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center space-x-1">
            <span>Trung lập</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {feedback}
          </Badge>
        );
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.history.title')}>
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
    <AdminLayout title={t('admin.history.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.history.list')}
            </h2>
            <p className="text-gray-600">
              Quản lý lịch sử hỏi đáp AI với cư dân
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
                  placeholder="Tìm kiếm theo người dùng, câu hỏi, câu trả lời..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterFeedback}
                  onChange={(e) => setFilterFeedback(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="POSITIVE">Tích cực</option>
                  <option value="NEGATIVE">Tiêu cực</option>
                  <option value="NEUTRAL">Trung lập</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Q&A History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lịch sử hỏi đáp ({filteredQARecords.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQARecords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.history.user')}</TableHead>
                      <TableHead>{t('admin.history.question')}</TableHead>
                      <TableHead>{t('admin.history.answer')}</TableHead>
                      <TableHead>{t('admin.history.feedback')}</TableHead>
                      <TableHead>{t('admin.history.createdAt')}</TableHead>
                      <TableHead>{t('admin.users.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQARecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.user}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={record.question}>
                            {truncateText(record.question, 80)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={record.answer}>
                            {truncateText(record.answer, 80)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getFeedbackBadge(record.feedback)}
                        </TableCell>
                        <TableCell>
                          {new Date(record.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin-dashboard/history/${record.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4" />
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