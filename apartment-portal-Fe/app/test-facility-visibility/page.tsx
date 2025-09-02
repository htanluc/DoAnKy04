"use client";

import React, { useState, useEffect } from 'react';
import { facilitiesApi, Facility } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EyeIcon, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestFacilityVisibilityPage() {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const data = await facilitiesApi.getAll();
      setFacilities(data);
      toast({
        title: 'Thành công',
        description: `Đã tải ${data.length} tiện ích`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tiện ích',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id: number) => {
    try {
      const updatedFacility = await facilitiesApi.toggleVisibility(id);
      setFacilities(prev => 
        prev.map(facility => 
          facility.id === id ? updatedFacility : facility
        )
      );
      toast({
        title: 'Thành công',
        description: `Đã ${updatedFacility.isVisible ? 'hiển thị' : 'ẩn'} tiện ích`,
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái hiển thị',
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Test Facility Visibility</h1>
        <Button onClick={fetchFacilities} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-4">
        {facilities.map((facility) => (
          <Card key={facility.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{facility.name}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={facility.isVisible ? "default" : "secondary"}
                    className={facility.isVisible 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-gray-50 text-gray-700 border-gray-200"
                    }
                  >
                    {facility.isVisible ? (
                      <>
                        <EyeIcon className="h-3 w-3 mr-1" />
                        Hiển thị
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Ẩn
                      </>
                    )}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVisibility(facility.id)}
                  >
                    {facility.isVisible ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Ẩn
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Hiện
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-2">{facility.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Vị trí:</strong> {facility.location || 'Không có'}
                </div>
                <div>
                  <strong>Sức chứa:</strong> {facility.capacity}
                </div>
                <div>
                  <strong>Phí sử dụng:</strong> {facility.usageFee || 0}
                </div>
                <div>
                  <strong>Giờ mở cửa:</strong> {facility.openingHours || 'Không có'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {facilities.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Không có tiện ích nào</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
