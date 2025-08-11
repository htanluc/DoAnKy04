'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AdminLayout from '@/components/admin/AdminLayout'
import { useApartments, ApartmentDetails, Vehicle, WaterMeter, VEHICLE_TYPE_DISPLAY, VEHICLE_TYPE_COLORS } from '@/hooks/use-apartments'
import { useInvoices } from '@/hooks/use-invoices'
import Link from 'next/link'
import { apiFetch } from '@/lib/api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

export default function ApartmentDetail() {
  const params = useParams()
  const id = parseInt(params.id as string)

  const { getApartmentById, getLinkedResidents, getApartmentVehicles, getApartmentWaterMeters, loading, error } = useApartments()
  const { getLatestInvoice } = useInvoices()

  const [apartment, setApartment] = useState<ApartmentDetails | null>(null)
  const [residents, setResidents] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [waterMeters, setWaterMeters] = useState<WaterMeter[]>([])
  const [latestInvoice, setLatestInvoice] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  
  // States for resident linking
  const [linkingPhone, setLinkingPhone] = useState('')
  const [foundUser, setFoundUser] = useState<any>(null)
  const [selectedRelationType, setSelectedRelationType] = useState('OWNER')
  const [linkingLoading, setLinkingLoading] = useState(false)
  const [linkingError, setLinkingError] = useState('')
  const [linkingSuccess, setLinkingSuccess] = useState('')

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const [loadingStates, setLoadingStates] = useState({
    apartment: false,
    residents: false,
    vehicles: false,
    waterMeters: false,
    invoice: false
  });

  const addDebugInfo = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const loadData = async () => {
    setDebugInfo([]); // Clear previous debug info
    addDebugInfo('Bắt đầu tải dữ liệu...');

    // Load apartment details
    setLoadingStates(prev => ({ ...prev, apartment: true }));
    addDebugInfo('Đang tải thông tin căn hộ...');
    const apt = await getApartmentById(id);
    setApartment(apt);
    addDebugInfo(`Căn hộ: ${apt ? `${apt.number} - ${apt.building}` : 'Không tìm thấy'}`);
    setLoadingStates(prev => ({ ...prev, apartment: false }));

    // Load residents
    setLoadingStates(prev => ({ ...prev, residents: true }));
    addDebugInfo('Đang tải cư dân...');
    const res = await getLinkedResidents(id);
    setResidents(res || []);
    addDebugInfo(`Tìm thấy ${(res || []).length} cư dân`);
    if (res && res.length > 0) {
      res.forEach((r, idx) => {
        addDebugInfo(`Cư dân ${idx + 1}: ${r.fullName || 'Không có tên'} (${r.relationType})`);
      });
    }
    setLoadingStates(prev => ({ ...prev, residents: false }));

    // Load vehicles
    setLoadingStates(prev => ({ ...prev, vehicles: true }));
    addDebugInfo('Đang tải xe...');
    const veh = await getApartmentVehicles(id);
    setVehicles(veh || []);
    addDebugInfo(`Tìm thấy ${(veh || []).length} xe`);
    if (veh && veh.length > 0) {
      veh.forEach((v, idx) => {
        addDebugInfo(`Xe ${idx + 1}: ${v.licensePlate} (${v.ownerName || 'Không rõ chủ xe'})`);
      });
    }
    setLoadingStates(prev => ({ ...prev, vehicles: false }));

    // Load water meters
    setLoadingStates(prev => ({ ...prev, waterMeters: true }));
    addDebugInfo('Đang tải chỉ số nước...');
    const wm = await getApartmentWaterMeters(id);
    if (wm) {
      setWaterMeters(wm.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()));
      addDebugInfo(`Tìm thấy ${wm.length} chỉ số nước`);
    } else {
      addDebugInfo('Không có chỉ số nước');
    }
    setLoadingStates(prev => ({ ...prev, waterMeters: false }));

    // Load latest invoice
    setLoadingStates(prev => ({ ...prev, invoice: true }));
    addDebugInfo('Đang tải hóa đơn...');
    const invoice = await getLatestInvoice(id);
    setLatestInvoice(invoice);
    addDebugInfo(invoice ? 'Tìm thấy hóa đơn gần nhất' : 'Không có hóa đơn');
    setLoadingStates(prev => ({ ...prev, invoice: false }));

    addDebugInfo('Hoàn thành tải dữ liệu!');
  }

  // Find user by phone number
  const handleFindUser = async () => {
    setLinkingError('');
    setLinkingSuccess('');
    setFoundUser(null);
    
    if (!linkingPhone) {
      setLinkingError('Vui lòng nhập số điện thoại');
      return;
    }
    
    setLinkingLoading(true);
    try {
      const response = await apiFetch('/api/admin/users');
      if (response.ok) {
        const users = await response.json();
        const usersArray = Array.isArray(users) ? users : users.data || [];
        const found = usersArray.find((u: any) => u.phoneNumber === linkingPhone);
        
        if (found) {
          setFoundUser(found);
          addDebugInfo(`Tìm thấy user: ${found.fullName || found.username} (ID: ${found.id})`);
        } else {
          setLinkingError('Không tìm thấy tài khoản với số điện thoại này');
        }
      } else {
        setLinkingError('Lỗi khi tìm kiếm tài khoản');
      }
    } catch (err) {
      setLinkingError('Lỗi kết nối');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Link user to apartment
  const handleLinkUser = async () => {
    if (!foundUser?.id) {
      setLinkingError('Chưa chọn user để liên kết');
      return;
    }

    setLinkingLoading(true);
    setLinkingError('');
    setLinkingSuccess('');

    try {
      const response = await apiFetch(`/api/apartments/${id}/residents`, {
        method: 'POST',
        body: JSON.stringify({
          userId: foundUser.id,
          relationType: selectedRelationType
        })
      });

      if (response.ok) {
        setLinkingSuccess('Liên kết cư dân thành công!');
        setLinkingPhone('');
        setFoundUser(null);
        setSelectedRelationType('OWNER');
        addDebugInfo(`Đã liên kết user ${foundUser.fullName} với căn hộ`);
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setLinkingError(errorData.message || 'Lỗi khi liên kết cư dân');
      }
    } catch (err) {
      setLinkingError('Lỗi kết nối');
    } finally {
      setLinkingLoading(false);
    }
  };

  // Unlink user from apartment
  const handleUnlinkUser = async (userId: number, residentName: string) => {
    if (!confirm(`Bạn có chắc muốn hủy liên kết cư dân ${residentName}?`)) {
      return;
    }

    setLinkingLoading(true);
    try {
      const response = await apiFetch(`/api/apartments/${id}/residents`, {
        method: 'DELETE',
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        addDebugInfo(`Đã hủy liên kết user ${residentName}`);
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Lỗi khi hủy liên kết');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setLinkingLoading(false);
    }
  };

  if (!apartment) {
    return (
      <AdminLayout>
        <div className="flex items-center gap-4">
          <Link href="/admin-dashboard/apartments">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          </Link>
        </div>
        <div className="mt-6">
          <Alert variant="destructive">
            <AlertDescription>Không tìm thấy thông tin căn hộ</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-dashboard/apartments">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Chi tiết căn hộ {apartment.number || (apartment as any).unitNumber || (apartment as any).name || `#${id}`}</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadData}
              disabled={Object.values(loadingStates).some(loading => loading)}
            >
              🔄 Reload Data
            </Button>

          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin căn hộ</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã/Số căn hộ</p>
                <p>{apartment.number || (apartment as any).unitNumber || (apartment as any).name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tòa nhà</p>
                <p>{apartment.building || (apartment as any).buildingName || (apartment as any).building || ((apartment as any).buildingId ? `Tòa ${ (apartment as any).buildingId }` : '-')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tầng</p>
                <p>{(apartment as any).floor ?? (apartment as any).floorNumber ?? '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diện tích</p>
                <p>{(apartment as any).area ?? (apartment as any).areaM2 ?? (apartment as any).squareMeters ?? '-'} m²</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <Badge>{apartment.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quản lý cư dân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Liên kết cư dân mới */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">➕ Liên kết cư dân mới</h3>
              
              {linkingError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{linkingError}</AlertDescription>
                </Alert>
              )}
              
              {linkingSuccess && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{linkingSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        placeholder="Nhập số điện thoại"
                        value={linkingPhone}
                        onChange={(e) => setLinkingPhone(e.target.value)}
                        disabled={linkingLoading}
                      />
                      <Button 
                        onClick={handleFindUser} 
                        disabled={linkingLoading || !linkingPhone}
                        variant="outline"
                      >
                        {linkingLoading ? '🔍' : '🔍 Tìm'}
                      </Button>
                    </div>
                  </div>

                  {foundUser && (
                    <div className="p-3 border rounded bg-blue-50">
                      <p className="font-medium">👤 {foundUser.fullName || foundUser.username}</p>
                      <p className="text-sm text-gray-600">📧 {foundUser.email}</p>
                      <p className="text-sm text-gray-600">📱 {foundUser.phoneNumber}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="relationType">Quan hệ với căn hộ</Label>
                    <Select value={selectedRelationType} onValueChange={setSelectedRelationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OWNER">Chủ hộ</SelectItem>
                        <SelectItem value="TENANT">Người thuê</SelectItem>
                        <SelectItem value="FAMILY">Thành viên gia đình</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleLinkUser}
                    disabled={linkingLoading || !foundUser}
                    className="w-full"
                  >
                    {linkingLoading ? '⏳ Đang liên kết...' : '🔗 Liên kết cư dân'}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Danh sách cư dân hiện tại */}
            <div>
              <h3 className="text-lg font-medium mb-3">Cư dân đang ở ({residents.length})</h3>
              {loadingStates.residents ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : residents.length === 0 ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Chưa có cư dân liên kết</p>
                  <Alert>
                    <AlertDescription>
                      Sử dụng form bên trên để liên kết cư dân với căn hộ này.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Quan hệ</TableHead>
                      <TableHead>Ngày vào</TableHead>
                      <TableHead>Ngày ra</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {residents.map((res: any, index: number) => (
                      <TableRow key={`${res.id || res.residentId || res.userId || index}`}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              <Link href={`/admin-dashboard/residents/${res.id || res.residentId}`} className="text-blue-600 hover:underline">
                                {res.fullName || 'Không có tên'}
                              </Link>
                            </div>
                            {res.email && (
                              <div className="text-sm text-muted-foreground">{res.email}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {res.phoneNumber || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {res.relationType === 'OWNER' ? 'Chủ hộ' : 
                             res.relationType === 'TENANT' ? 'Người thuê' : 
                             res.relationType === 'FAMILY' ? 'Thành viên gia đình' : res.relationType}
                          </Badge>
                        </TableCell>
                        <TableCell>{res.moveInDate ? new Date(res.moveInDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>
                          {res.moveOutDate ? (
                            <div className="text-red-600">{new Date(res.moveOutDate).toLocaleDateString()}</div>
                          ) : (
                            <Badge variant="secondary">Đang ở</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnlinkUser(res.userId, res.fullName)}
                            disabled={linkingLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xe đăng ký</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.vehicles ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">Chưa có xe đăng ký</p>
                <Alert>
                  <AlertDescription>
                    Có thể cư dân trong căn hộ này chưa đăng ký xe hoặc endpoint backend để lấy vehicles theo userId chưa được triển khai.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chủ xe</TableHead>
                    <TableHead>Loại xe</TableHead>
                    <TableHead>Thương hiệu & Model</TableHead>
                    <TableHead>Biển số</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((veh: Vehicle, index: number) => (
                    <TableRow key={`${veh.id || index}`}>
                      <TableCell>
                        <div className="font-medium">
                          {veh.ownerName || 'Không rõ'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${VEHICLE_TYPE_COLORS[veh.vehicleType || veh.type] || 'bg-gray-100 text-gray-800'} border-0`}
                        >
                          {VEHICLE_TYPE_DISPLAY[veh.vehicleType || veh.type] || veh.vehicleType || veh.type || 'Không rõ loại'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {veh.brand || 'Không rõ hãng'} {veh.model && `- ${veh.model}`}
                          </div>
                          {veh.model && veh.brand && (
                            <div className="text-xs text-muted-foreground">
                              Model: {veh.model}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-bold text-lg bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block">
                          {veh.licensePlate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300" 
                            style={{ backgroundColor: veh.color.toLowerCase() }}
                            title={veh.color}
                          ></div>
                          <span className="capitalize">{veh.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>{veh.registrationDate ? new Date(veh.registrationDate).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chỉ số nước</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStates.waterMeters ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : waterMeters.length === 0 ? (
              <p className="text-muted-foreground">Chưa có chỉ số nước</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày đọc</TableHead>
                    <TableHead>Chỉ số trước</TableHead>
                    <TableHead>Chỉ số hiện tại</TableHead>
                    <TableHead>Tiêu thụ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waterMeters.map((wm: WaterMeter, index: number) => (
                    <TableRow key={`${wm.id || index}`}>
                      <TableCell>{wm.readingDate ? new Date(wm.readingDate).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{wm.previousReading}</TableCell>
                      <TableCell>{wm.currentReading}</TableCell>
                      <TableCell>{wm.consumption} m³</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {latestInvoice && (
          <Card>
            <CardHeader>
              <CardTitle>Hóa đơn gần nhất</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Kỳ hóa đơn</p>
                  <p>{new Date(latestInvoice.billingPeriod).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tiền</p>
                  <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(latestInvoice.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>
                  <Badge variant={latestInvoice.status === 'PAID' ? 'default' : 'destructive'}>
                    {latestInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Badge>
                </div>
                <div>
                  <Link href={`/admin-dashboard/invoices/${latestInvoice.id}`}>
                    <Button variant="outline">Xem chi tiết</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Information */}
        {debugInfo.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm font-mono bg-gray-100 p-3 rounded max-h-60 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
} 