"use client";
import { useState, useEffect } from "react";
import { useWaterMeter } from "../../../hooks/use-water-meter";
import { useApartments } from "../../../hooks/use-apartments";
import AdminLayout from "@/components/admin/AdminLayout";
import { useLanguage } from "@/lib/i18n";

export default function WaterMeterListPage() {
  const { t } = useLanguage();
  const { readings, loading, error, updateReading, addReading, deleteReading, patchReading, bulkGenerate, fetchReadingsByMonth, fetchReadings } = useWaterMeter();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const [editId, setEditId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<{ currentReading?: number }>({});
  const [search, setSearch] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccess, setGenSuccess] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>("");
  
  // Lấy danh sách các tháng có trong dữ liệu (từ tất cả dữ liệu, không phụ thuộc vào tháng đang chọn)
  const [allReadings, setAllReadings] = useState<any[]>([]);
  
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
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

  // Logic phân trang
  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReadings = filteredReadings.slice(startIndex, endIndex);

  // Reset về trang 1 khi thay đổi tìm kiếm hoặc tháng
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedMonth]);

  const handleEditClick = (r: any) => {
    const rowKey = r.readingId ?? `${r.apartmentId}-${r.readingMonth}`;
    setEditId(rowKey);
    setEditForm({
      currentReading: r.currentReading ?? 0,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: Number(e.target.value) });
  };

  const handleEditSave = async (id: string | number, row: any) => {
    // Nếu có readingId thật sự thì PATCH, nếu chưa có thì tạo mới (POST)
    if (row.readingId != null) {
      await patchReading(Number(row.readingId), {
        currentReading: editForm.currentReading ?? 0,
      });
    } else {
      await addReading({
        apartmentId: row.apartmentId,
        readingMonth: row.readingMonth,
        previousReading: row.previousReading ?? 0,
        currentReading: editForm.currentReading ?? 0,
      });
    }
    setEditId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      await deleteReading(Number(id));
    }
  };

  // Kiểm tra xem tháng đã có dữ liệu chưa
  const monthHasData = (month: string) => {
    return allReadings.some(r => r.readingMonth === month);
  };

  const handleGenerate = async () => {
    // Kiểm tra nếu tháng đã có dữ liệu
    if (monthHasData(startMonth)) {
      setGenError(t('admin.waterMeter.cannotGenerate'));
      return;
    }

    setGenLoading(true);
    setGenError(null);
    setGenSuccess(null);
    try {
      await bulkGenerate(startMonth);
      setGenSuccess(t('admin.waterMeter.generateSuccess'));
      // Reload all readings sau khi tạo thành công
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
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <AdminLayout title={t('admin.waterMeter.title','Danh sách chỉ số nước')}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{t('admin.waterMeter.title')}</h1>
        <div className="mb-4 space-y-2">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedMonth}
              onChange={e => handleMonthChange(e.target.value)}
              className="border px-2 py-1 rounded"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder={t('admin.waterMeter.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border px-2 py-1 rounded w-64"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="month"
              value={startMonth}
              onChange={e => setStartMonth(e.target.value)}
              className="border px-2 py-1 rounded"
            />
            <button
              className={`px-4 py-2 rounded ${
                monthHasData(startMonth) 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              onClick={handleGenerate}
              disabled={genLoading || !startMonth || monthHasData(startMonth)}
            >
              {genLoading ? t('admin.waterMeter.generating') : t('admin.waterMeter.generate')}
            </button>
            {startMonth && monthHasData(startMonth) && (
              <span className="text-orange-600 text-sm font-medium">
                {t('admin.waterMeter.monthExists')}
              </span>
            )}
          </div>
        </div>
        {genError && <p className="text-red-500 mb-2">{genError}</p>}
        {genSuccess && <p className="text-green-600 mb-2">{genSuccess}</p>}
        {loading && <p>{t('admin.waterMeter.loading')}</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {/* Thông báo khi chưa có dữ liệu */}
        {!selectedMonth && readings.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 font-medium">{t('admin.waterMeter.pickMonthHint')}</p>
          </div>
        )}
        
        {/* Hiển thị thông tin tháng đang xem */}
        {selectedMonth && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex justify-between items-center">
              <p className="text-blue-800 font-medium">{t('admin.waterMeter.viewingMonth')} <span className="font-bold">{selectedMonth}</span></p>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-600">{t('admin.waterMeter.totalApts')} <span className="font-bold">{filteredReadings.length}</span></span>
                <span className="text-green-600">{t('admin.waterMeter.totalConsumption')} <span className="font-bold">{filteredReadings.reduce((sum, r) => sum + (r.consumption || (r.currentReading - r.previousReading)), 0)} m³</span></span>
                <span className="text-blue-600">{t('admin.waterMeter.pagination.showing')} <span className="font-bold">{startIndex + 1}-{Math.min(endIndex, filteredReadings.length)}</span> {t('admin.waterMeter.pagination.of')} <span className="font-bold">{filteredReadings.length}</span> {t('admin.waterMeter.pagination.entries')}</span>
                <button 
                  onClick={() => handleMonthChange("")}
                  className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  {t('admin.waterMeter.viewAll')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {selectedMonth && (
          <>
            <table className="w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.apartment')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.month')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.prev')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.current')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.consumption')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.recordedBy','Người ghi')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.recordedAt','Thời gian ghi')}</th>
                  <th className="border px-2 py-1">{t('admin.waterMeter.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReadings.map((r: any) => {
                  const rowKey = r.readingId ?? `${r.apartmentId}-${r.readingMonth}`;
                  return (
                    <tr key={rowKey}>
                      <td className="border px-2 py-1">{r.apartmentName || r.apartmentId}</td>
                      <td className="border px-2 py-1">{r.readingMonth}</td>
                      <td className="border px-2 py-1">{r.previousReading}</td>
                      <td className="border px-2 py-1">
                        {editId === rowKey ? (
                          <input
                            type="number"
                            name="currentReading"
                            value={editForm.currentReading ?? ""}
                            onChange={handleEditChange}
                            className="border px-1 py-0.5 w-20"
                          />
                        ) : (
                          r.currentReading
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <span className="font-medium text-blue-600">
                          {r.consumption || (r.currentReading - r.previousReading)}
                        </span>
                      </td>
                      <td className="border px-2 py-1">{r.recordedByName || r.recordedBy || '-'}</td>
                      <td className="border px-2 py-1">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                      <td className="border px-2 py-1">
                        {editId === rowKey ? (
                          <>
                            <button
                              className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                              onClick={() => handleEditSave(rowKey, r)}
                            >
                              {t('admin.waterMeter.btn.save')}
                            </button>
                            <button
                              className="bg-gray-400 text-white px-2 py-1 rounded mr-2"
                              onClick={() => setEditId(null)}
                            >
                              {t('admin.waterMeter.btn.cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
                              onClick={() => handleEditClick(r)}
                            >
                              {t('admin.waterMeter.btn.edit')}
                            </button>
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded"
                              onClick={() => handleDelete(r.readingId)}
                            >
                              {t('admin.waterMeter.btn.delete')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {t('admin.waterMeter.pagination.showing')} {startIndex + 1}-{Math.min(endIndex, filteredReadings.length)} {t('admin.waterMeter.pagination.of')} {filteredReadings.length} {t('admin.waterMeter.pagination.entries')}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {t('admin.waterMeter.pagination.previous')}
                  </button>
                  
                  <span className="px-3 py-1 bg-gray-100 rounded">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {t('admin.waterMeter.pagination.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
