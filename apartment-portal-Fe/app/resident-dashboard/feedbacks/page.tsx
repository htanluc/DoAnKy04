"use client";
import { useEffect } from "react";
import { useFeedbacks } from "@/hooks/use-feedbacks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function ResidentFeedbacksPage() {
  const { feedbacks, loading, error, fetchMyFeedbacks } = useFeedbacks();

  useEffect(() => {
    fetchMyFeedbacks();
    // eslint-disable-next-line
  }, []);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case "RESPONDED":
        return <Badge className="bg-green-100 text-green-800">Đã phản hồi</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Phản hồi của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Bạn chưa có phản hồi nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Đánh giá</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((fb) => (
                    <TableRow key={fb.id}>
                      <TableCell>{fb.categoryName}</TableCell>
                      <TableCell>{fb.title || <span className="italic text-gray-400">(Không có)</span>}</TableCell>
                      <TableCell>{renderStars(fb.rating)}</TableCell>
                      <TableCell>{getStatusBadge(fb.status)}</TableCell>
                      <TableCell>{new Date(fb.createdAt).toLocaleString("vi-VN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 