"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';

export default function TestApartmentLinkPage() {
  const [apartmentId, setApartmentId] = useState('');
  const [userId, setUserId] = useState('');
  const [relationType, setRelationType] = useState('OWNER');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTestLink = async () => {
    if (!apartmentId || !userId || !relationType) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          relationType: relationType
        }),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.ok && data.success) {
        toast({
          title: 'Thành công',
          description: 'Liên kết căn hộ thành công!'
        });
      } else {
        toast({
          title: 'Lỗi',
          description: data.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      });
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối mạng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestUnlink = async () => {
    if (!apartmentId || !userId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền apartment ID và user ID',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          userId: parseInt(userId)
        }),
      });

      const data = await response.json();
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      });

      if (response.ok && data.success) {
        toast({
          title: 'Thành công',
          description: 'Hủy liên kết căn hộ thành công!'
        });
      } else {
        toast({
          title: 'Lỗi',
          description: data.message || 'Có lỗi xảy ra',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      });
      toast({
        title: 'Lỗi',
        description: 'Lỗi kết nối mạng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Test API Gán Căn Hộ</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin liên kết</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Apartment ID:</label>
            <Input
              type="number"
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              placeholder="Nhập ID căn hộ"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">User ID:</label>
            <Input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Nhập ID người dùng"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Loại quan hệ:</label>
            <Select value={relationType} onValueChange={setRelationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Chủ hộ (OWNER)</SelectItem>
                <SelectItem value="TENANT">Người thuê (TENANT)</SelectItem>
                <SelectItem value="FAMILY_MEMBER">Thành viên gia đình (FAMILY_MEMBER)</SelectItem>
                <SelectItem value="GUEST">Khách (GUEST)</SelectItem>
                <SelectItem value="MANAGER">Người quản lý (MANAGER)</SelectItem>
                <SelectItem value="CO_OWNER">Đồng sở hữu (CO_OWNER)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleTestLink} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Đang xử lý...' : 'Test Liên kết'}
            </Button>
            
            <Button 
              onClick={handleTestUnlink} 
              disabled={loading}
              variant="destructive"
              className="flex-1"
            >
              {loading ? 'Đang xử lý...' : 'Test Hủy liên kết'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Kết quả</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
