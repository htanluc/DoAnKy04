"use client";
import { useState, useEffect } from "react";
import { useWaterMeter } from "../../../hooks/use-water-meter";
import { useApartments } from "../../../hooks/use-apartments";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Droplets,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";

export default function WaterMeterListPage() {
  const { readings, loading, error, updateReading, addReading, deleteReading, patchReading, bulkGenerate, fetchReadingsByMonth, fetchReadings } = useWaterMeter();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<{ [key: string]: number }>({});
  const [search, setSearch] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  
  // Lấy danh sách các tháng có trong dữ liệu (từ tất cả dữ liệu, không phụ thuộc vào tháng đang chọn)
  const [allReadings, setAllReadings] = useState<any[]>([]);
  
  // Load tất cả dữ liệu khi component mount
  useEffect(() => {
    const loadAllReadings = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch('http://localhost:8080/api/admin/water-readings', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAllReadings(data);
        }
      } catch (error) {
        console.error('Error loading all readings:', error);
      }
    };
    loadAllReadings();
  }, []);
  
  const months = Array.from(new Set(allReadings.map(r => r.readingMonth))).sort().reverse();
  
  // Tự động chọn tháng đầu tiên và load dữ liệu
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      const firstMonth = months[0];
      setSelectedMonth(firstMonth);
      fetchReadingsByMonth(firstMonth);
    }
  }, [months, selectedMonth, fetchReadingsByMonth]);

  // Xử lý khi chọn tháng
  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);
    console.log('Loading data for month:', month);
    await fetchReadingsByMonth(month);
  };

  // Lọc readings theo tìm kiếm
  const filteredReadings = readings.filter((r: any) =>
    ((r.apartmentId + "").toLowerCase().includes(search.toLowerCase()) ||
      (r.apartmentName || "").toLowerCase().includes(search.toLowerCase()))
  );

  const handleEditClick = (r: any) => {
    const readingId = r.readingId || r.id;
    setEditId(readingId);
    setEditForm({
      [readingId]: r.currentReading ?? 0,
    });
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditForm({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>, readingId: string | number) => {
    const value = Number(e.target.value);
    setEditForm(prev => ({
      ...prev,
      [readingId]: value
    }));
  };

  const handleEditSave = async (id: string | number) => {
    try {
      const currentReading = editForm[id] ?? 0;
      
      // Validation
      if (currentReading < 0) {
        setGenError('Chỉ số nước không được âm');
        // Clear error message after 3 seconds
        setTimeout(() => {
          setGenError(null);
        }, 3000);
        return;
      }
      
      await patchReading(Number(id), {
        currentReading: currentReading,
      });
      setEditId(null);
      setEditForm({});
      setGenSuccess('Cập nhật chỉ số nước thành công!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setGenSuccess(null);
      }, 3000);
      
      // Reload data after successful update
      await fetchReadingsByMonth(selectedMonth);
    } catch (error) {
      console.error('Error updating reading:', error);
      setGenError('Có lỗi xảy ra khi cập nhật chỉ số nước');
      // Clear error message after 5 seconds
      setTimeout(() => {
        setGenError(null);
      }, 5000);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await deleteReading(Number(id));
        setGenSuccess('Xóa chỉ số nước thành công!');
        // Clear success message after 3 seconds
        setTimeout(() => {
          setGenSuccess(null);
        }, 3000);
        // Reload data after successful delete
        await fetchReadingsByMonth(selectedMonth);
      } catch (error) {
        console.error('Error deleting reading:', error);
        setGenError('Có lỗi xảy ra khi xóa chỉ số nước');
        // Clear error message after 5 seconds
        setTimeout(() => {
          setGenError(null);
        }, 5000);
      }
    }
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    setGenError(null);
    setGenSuccess(null);
    try {
      await bulkGenerate(startMonth);
      setGenSuccess("Tạo lịch sử chỉ số nước thành công!");
      // Clear success message after 5 seconds
      setTimeout(() => {
        setGenSuccess(null);
      }, 5000);
      // Reload data after generation
      await fetchReadings();
    } catch (err: any) {
      setGenError(err.message || "Có lỗi xảy ra khi tạo chỉ số nước");
      // Clear error message after 5 seconds
      setTimeout(() => {
        setGenError(null);
      }, 5000);
    } finally {
      setGenLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <AdminLayout title="Quản lý chỉ số nước">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý chỉ số nước</h1>
            <p className="text-gray-600">Theo dõi và quản lý chỉ số nước của các căn hộ</p>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng căn hộ</p>
                  <p className="text-2xl font-bold text-gray-900">{apartments.length}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Droplets className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Có chỉ số</p>
                  <p className="text-2xl font-bold text-green-600">{readings.length}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tháng hiện tại</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedMonth || 'Chưa chọn'}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng tiêu thụ</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredReadings.reduce((sum, r) => sum + (r.consumption || (r.currentReading - r.previousReading)), 0)} m³
                  </p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Droplets className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Điều khiển
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Chọn tháng:</label>
                <select
                  value={selectedMonth}
                  onChange={e => handleMonthChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Chọn tháng để xem chỉ số nước"
                >
                  <option value="">Tất cả tháng</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm căn hộ (ID hoặc mã)"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tạo chỉ số từ tháng:</label>
                <Input
                  type="month"
                  value={startMonth}
                  onChange={e => setStartMonth(e.target.value)}
                  className="w-48"
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={genLoading || !startMonth}
                className="bg-green-600 hover:bg-green-700"
              >
                {genLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo lịch sử chỉ số nước
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {genError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{genError}</AlertDescription>
          </Alert>
        )}
        {genSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{genSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Data Table */}
        {!loading && selectedMonth && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chỉ số nước tháng {selectedMonth}</span>
                <Badge variant="secondary">
                  {filteredReadings.length} căn hộ
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Căn hộ</TableHead>
                    <TableHead>Tháng</TableHead>
                    <TableHead>Chỉ số trước</TableHead>
                    <TableHead>Chỉ số mới</TableHead>
                    <TableHead>Lượng tiêu thụ (m³)</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReadings.map((r: any) => {
                    const readingId = r.readingId || r.id || `temp-${r.apartmentId}-${r.readingMonth}`;
                    const isEditing = editId === readingId;
                    
                    return (
                      <TableRow key={readingId}>
                        <TableCell className="font-medium">
                          {r.apartmentName || `Căn hộ ${r.apartmentId}`}
                        </TableCell>
                        <TableCell>{r.readingMonth}</TableCell>
                        <TableCell>{r.previousReading}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              name="currentReading"
                              value={editForm[readingId] ?? r.currentReading ?? ""}
                              onChange={(e) => handleEditChange(e, readingId)}
                              className="w-20"
                              min="0"
                              step="0.01"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSave(readingId);
                                } else if (e.key === 'Escape') {
                                  handleEditCancel();
                                }
                              }}
                            />
                          ) : (
                            r.currentReading
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium text-blue-600">
                            {r.consumption || (r.currentReading - r.previousReading)} m³
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleEditSave(readingId)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Lưu
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleEditCancel}
                                >
                                  Hủy
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditClick(r)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(readingId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* No data message */}
        {!loading && !selectedMonth && readings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">
                Vui lòng chọn tháng để xem chỉ số nước
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
