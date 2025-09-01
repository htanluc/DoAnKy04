import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  fileName?: string;
  sheetName?: string;
  includeHeaders?: boolean;
}

export interface ResidentExcelData {
  'ID': number;
  'Họ Tên': string;
  'Số Điện Thoại': string;
  'Email': string;
  'CMND/CCCD': string;
  'Trạng Thái': string;
  'Ngày Tạo': string;
}

export interface UserExcelData {
  'ID': number;
  'Tên đăng nhập': string;
  'Họ Tên': string;
  'Email': string;
  'Số Điện Thoại': string;
  'Vai trò': string;
  'Trạng Thái': string;
  'Ngày tạo': string;
}

/**
 * Xuất dữ liệu cư dân ra file Excel
 */
export function exportResidentsToExcel(
  residents: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `danh-sach-cu-dan-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Cư Dân',
    includeHeaders = true
  } = options;

  try {
    // Chuẩn bị dữ liệu cho Excel
    const excelData: ResidentExcelData[] = residents.map(resident => ({
      'ID': resident.id,
      'Họ Tên': resident.fullName || '',
      'Số Điện Thoại': resident.phoneNumber || '',
      'Email': resident.email || '',
      'CMND/CCCD': resident.identityNumber || resident.idCard || '',
      'Trạng Thái': getStatusText(resident.status),
      'Ngày Tạo': formatDate(resident.createdAt || resident.registrationDate || new Date())
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 25 },  // Họ Tên
      { wch: 15 },  // Số Điện Thoại
      { wch: 30 },  // Email
      { wch: 20 },  // CMND/CCCD
      { wch: 15 },  // Trạng Thái
      { wch: 15 }   // Ngày Tạo
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất dữ liệu người dùng ra file Excel
 */
export function exportUsersToExcel(
  users: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `danh-sach-nguoi-dung-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Người Dùng',
    includeHeaders = true
  } = options;

  try {
    // Chuẩn bị dữ liệu cho Excel
    const excelData: UserExcelData[] = users.map(user => ({
      'ID': user.id,
      'Tên đăng nhập': user.username || '',
      'Họ Tên': user.fullName || '',
      'Email': user.email || '',
      'Số Điện Thoại': user.phoneNumber || '',
      'Vai trò': getRoleNames(user).join(', '),
      'Trạng Thái': getStatusText(user.status),
      'Ngày tạo': formatDate(user.createdAt || user.registrationDate || new Date())
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 20 },  // Tên đăng nhập
      { wch: 25 },  // Họ Tên
      { wch: 30 },  // Email
      { wch: 15 },  // Số Điện Thoại
      { wch: 20 },  // Vai trò
      { wch: 15 },  // Trạng Thái
      { wch: 15 }   // Ngày tạo
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất dữ liệu người dùng theo tab (staff/resident) ra file Excel
 */
export function exportUsersByTabToExcel(
  users: any[],
  activeTab: 'staff' | 'resident',
  searchTerm: string,
  filterRole: string,
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `nguoi-dung-${activeTab}-${new Date().toISOString().split('T')[0]}`,
    sheetName = activeTab === 'staff' ? 'Nhân Viên' : 'Cư Dân',
    includeHeaders = true
  } = options;

  try {
    // Lọc dữ liệu theo tab và filter
    const filteredUsers = users.filter(user => {
      const roleNames = getRoleNames(user);
      // Loại bỏ user admin
      if (roleNames.includes('ADMIN') || user.username === 'admin') return false;
      
      const matchesSearch =
        (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (user.phoneNumber?.includes(searchTerm) ?? false) ||
        (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const inTab = activeTab === 'resident'
        ? roleNames.includes('RESIDENT')
        : roleNames.some(r => r !== 'RESIDENT' && r !== 'ADMIN');

      let matchesFilter = true;
      if (activeTab === 'resident') {
        matchesFilter = filterRole === 'all' || user.status === filterRole;
      } else {
        matchesFilter = filterRole === 'all' || roleNames.includes(filterRole);
      }

      return matchesSearch && inTab && matchesFilter;
    });

    // Chuẩn bị dữ liệu cho Excel
    const excelData: UserExcelData[] = filteredUsers.map(user => ({
      'ID': user.id,
      'Tên đăng nhập': user.username || '',
      'Họ Tên': user.fullName || '',
      'Email': user.email || '',
      'Số Điện Thoại': user.phoneNumber || '',
      'Vai trò': getRoleNames(user).join(', '),
      'Trạng Thái': getStatusText(user.status),
      'Ngày tạo': formatDate(user.createdAt || user.registrationDate || new Date())
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 20 },  // Tên đăng nhập
      { wch: 25 },  // Họ Tên
      { wch: 30 },  // Email
      { wch: 15 },  // Số Điện Thoại
      { wch: 20 },  // Vai trò
      { wch: 15 },  // Trạng Thái
      { wch: 15 }   // Ngày tạo
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất dữ liệu người dân đã lọc ra file Excel
 */
export function exportFilteredResidentsToExcel(
  residents: any[],
  searchTerm: string,
  filterStatus: string,
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `cu-dan-da-loc-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Cư Dân Đã Lọc',
    includeHeaders = true
  } = options;

  // Tạo tên file mô tả
  let descriptiveFileName = fileName;
  if (searchTerm) {
    descriptiveFileName += `-tim-kiem-${searchTerm}`;
  }
  if (filterStatus !== 'all') {
    descriptiveFileName += `-trang-thai-${filterStatus}`;
  }

  try {
    // Chuẩn bị dữ liệu cho Excel
    const excelData: ResidentExcelData[] = residents.map(resident => ({
      'ID': resident.id,
      'Họ Tên': resident.fullName || '',
      'Số Điện Thoại': resident.phoneNumber || '',
      'Email': resident.email || '',
      'CMND/CCCD': resident.identityNumber || resident.idCard || '',
      'Trạng Thái': getStatusText(resident.status),
      'Ngày Tạo': formatDate(resident.createdAt || resident.registrationDate || new Date())
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 25 },  // Họ Tên
      { wch: 15 },  // Số Điện Thoại
      { wch: 30 },  // Email
      { wch: 20 },  // CMND/CCCD
      { wch: 15 },  // Trạng Thái
      { wch: 15 }   // Ngày Tạo
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${descriptiveFileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${descriptiveFileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất dữ liệu cư dân theo trang ra file Excel
 */
export function exportPaginatedResidentsToExcel(
  allResidents: any[],
  currentPage: number,
  itemsPerPage: number,
  searchTerm: string,
  filterStatus: string,
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `cu-dan-trang-${currentPage}-${new Date().toISOString().split('T')[0]}`,
    sheetName = `Cư Dân - Trang ${currentPage}`,
    includeHeaders = true
  } = options;

  try {
    // Lọc dữ liệu theo search và filter
    const filteredResidents = allResidents.filter(resident => {
      const idCard = resident.identityNumber || resident.idCard || '';
      const matchesSearch = resident.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           idCard.includes(searchTerm) ||
                           resident.phoneNumber?.includes(searchTerm) ||
                           resident.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Tính toán dữ liệu cho trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResidents = filteredResidents.slice(startIndex, endIndex);

    // Chuẩn bị dữ liệu cho Excel
    const excelData: ResidentExcelData[] = currentResidents.map(resident => ({
      'ID': resident.id,
      'Họ Tên': resident.fullName || '',
      'Số Điện Thoại': resident.phoneNumber || '',
      'Email': resident.email || '',
      'CMND/CCCD': resident.identityNumber || resident.idCard || '',
      'Trạng Thái': getStatusText(resident.status),
      'Ngày Tạo': formatDate(resident.createdAt || resident.registrationDate || new Date())
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 25 },  // Họ Tên
      { wch: 15 },  // Số Điện Thoại
      { wch: 30 },  // Email
      { wch: 20 },  // CMND/CCCD
      { wch: 15 },  // Trạng Thái
      { wch: 15 }   // Ngày Tạo
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất dữ liệu tổng quan thống kê
 */
export function exportResidentsStatsToExcel(
  residents: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `thong-ke-cu-dan-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Thống Kê',
    includeHeaders = true
  } = options;

  try {
    // Tính toán thống kê
    const totalResidents = residents.length;
    const activeResidents = residents.filter(r => r.status === 'ACTIVE').length;
    const inactiveResidents = residents.filter(r => r.status === 'INACTIVE').length;
    const pendingResidents = residents.filter(r => r.status === 'PENDING').length;

    // Dữ liệu thống kê
    const statsData = [
      { 'Chỉ số': 'Tổng số cư dân', 'Giá trị': totalResidents },
      { 'Chỉ số': 'Cư dân hoạt động', 'Giá trị': activeResidents },
      { 'Chỉ số': 'Cư dân không hoạt động', 'Giá trị': inactiveResidents },
      { 'Chỉ số': 'Cư dân chờ xử lý', 'Giá trị': pendingResidents },
      { 'Chỉ số': 'Tỷ lệ hoạt động', 'Giá trị': `${((activeResidents / totalResidents) * 100).toFixed(1)}%` },
      { 'Chỉ số': 'Tỷ lệ không hoạt động', 'Giá trị': `${((inactiveResidents / totalResidents) * 100).toFixed(1)}%` }
    ];

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu thống kê
    const worksheet = XLSX.utils.json_to_sheet(statsData);

    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
      { wch: 25 },  // Chỉ số
      { wch: 15 }   // Giá trị
    ];

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất thống kê Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất thống kê Excel:', error);
    throw new Error('Không thể xuất file thống kê Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất thống kê người dùng ra file Excel
 */
export function exportUsersStatsToExcel(
  users: any[],
  activeTab: 'staff' | 'resident',
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `thong-ke-nguoi-dung-${activeTab}-${new Date().toISOString().split('T')[0]}`,
    sheetName = `Thống Kê ${activeTab === 'staff' ? 'Nhân Viên' : 'Cư Dân'}`,
    includeHeaders = true
  } = options;

  try {
    // Lọc dữ liệu theo tab
    const filteredUsers = users.filter(user => {
      const roleNames = getRoleNames(user);
      if (roleNames.includes('ADMIN') || user.username === 'admin') return false;
      
      if (activeTab === 'resident') {
        return roleNames.includes('RESIDENT');
      } else {
        return roleNames.some(r => r !== 'RESIDENT' && r !== 'ADMIN');
      }
    });

    // Tính toán thống kê
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.status === 'ACTIVE').length;
    const inactiveUsers = filteredUsers.filter(u => u.status === 'INACTIVE').length;

    // Thống kê theo role (chỉ cho staff)
    let roleStats = [];
    if (activeTab === 'staff') {
      const roleCounts: { [key: string]: number } = {};
      filteredUsers.forEach(user => {
        const roles = getRoleNames(user);
        roles.forEach(role => {
          if (role !== 'RESIDENT' && role !== 'ADMIN') {
            roleCounts[role] = (roleCounts[role] || 0) + 1;
          }
        });
      });
      roleStats = Object.entries(roleCounts).map(([role, count]) => ({
        'Vai trò': role,
        'Số lượng': count
      }));
    }

    // Dữ liệu thống kê
    const statsData = [
      { 'Chỉ số': `Tổng số ${activeTab === 'staff' ? 'nhân viên' : 'cư dân'}`, 'Giá trị': totalUsers },
      { 'Chỉ số': 'Đang hoạt động', 'Giá trị': activeUsers },
      { 'Chỉ số': 'Đã vô hiệu hóa', 'Giá trị': inactiveUsers },
      { 'Chỉ số': 'Tỷ lệ hoạt động', 'Giá trị': `${((activeUsers / totalUsers) * 100).toFixed(1)}%` },
      { 'Chỉ số': 'Tỷ lệ vô hiệu hóa', 'Giá trị': `${((inactiveUsers / totalUsers) * 100).toFixed(1)}%` }
    ];

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Worksheet thống kê chung
    const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
    statsWorksheet['!cols'] = [
      { wch: 30 },  // Chỉ số
      { wch: 15 }   // Giá trị
    ];
    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Thống Kê Chung');

    // Worksheet thống kê theo role (chỉ cho staff)
    if (activeTab === 'staff' && roleStats.length > 0) {
      const roleWorksheet = XLSX.utils.json_to_sheet(roleStats);
      roleWorksheet['!cols'] = [
        { wch: 20 },  // Vai trò
        { wch: 15 }   // Số lượng
      ];
      XLSX.utils.book_append_sheet(workbook, roleWorksheet, 'Thống Kê Theo Vai Trò');
    }

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất thống kê người dùng Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất thống kê người dùng Excel:', error);
    throw new Error('Không thể xuất file thống kê Excel. Vui lòng thử lại.');
  }
}

/**
 * Chuyển đổi trạng thái sang text tiếng Việt
 */
function getStatusText(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Hoạt động';
    case 'INACTIVE':
      return 'Không hoạt động';
    case 'PENDING':
      return 'Chờ xử lý';
    default:
      return status || 'Không xác định';
  }
}

/**
 * Format ngày tháng
 */
function formatDate(date: Date | string): string {
  if (!date) return 'Không xác định';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return 'Không xác định';
  }
}

/**
 * Lấy tên vai trò từ user (helper function)
 */
function getRoleNames(user: any): string[] {
  if (!user.roles || !Array.isArray(user.roles)) {
    return [];
  }
  return user.roles.map((role: any) => String(role));
}

// ==================== ANNOUNCEMENTS EXPORT ====================

export interface AnnouncementExcelData {
  'ID': number;
  'Tiêu đề': string;
  'Nội dung': string;
  'Loại thông báo': string;
  'Ngày tạo': string;
  'Trạng thái': string;
}

/**
 * Xuất dữ liệu thông báo ra file Excel
 */
export function exportAnnouncementsToExcel(
  announcements: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `danh-sach-thong-bao-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Thông Báo',
    includeHeaders = true
  } = options;

  try {
    // Chuẩn bị dữ liệu cho Excel
    const excelData: AnnouncementExcelData[] = announcements.map(announcement => ({
      'ID': announcement.id,
      'Tiêu đề': announcement.title || '',
      'Nội dung': announcement.content || '',
      'Loại thông báo': getAnnouncementTypeText(announcement.type),
      'Ngày tạo': formatDate(announcement.createdAt || new Date()),
      'Trạng thái': announcement.isActive ? 'Hoạt động' : 'Không hoạt động'
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 40 },  // Tiêu đề
      { wch: 60 },  // Nội dung
      { wch: 20 },  // Loại thông báo
      { wch: 15 },  // Ngày tạo
      { wch: 15 }   // Trạng thái
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất dữ liệu thông báo đã lọc ra file Excel
 */
export function exportFilteredAnnouncementsToExcel(
  announcements: any[],
  searchTerm: string,
  filterType: string,
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `thong-bao-da-loc-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Thông Báo Đã Lọc',
    includeHeaders = true
  } = options;

  // Tạo tên file mô tả
  let descriptiveFileName = fileName;
  if (searchTerm) {
    descriptiveFileName += `-tim-kiem-${searchTerm}`;
  }
  if (filterType !== 'all') {
    descriptiveFileName += `-loai-${filterType}`;
  }

  try {
    // Chuẩn bị dữ liệu cho Excel
    const excelData: AnnouncementExcelData[] = announcements.map(announcement => ({
      'ID': announcement.id,
      'Tiêu đề': announcement.title || '',
      'Nội dung': announcement.content || '',
      'Loại thông báo': getAnnouncementTypeText(announcement.type),
      'Ngày tạo': formatDate(announcement.createdAt || new Date()),
      'Trạng thái': announcement.isActive ? 'Hoạt động' : 'Không hoạt động'
    }));

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Thiết lập độ rộng cột tự động
    const columnWidths = [
      { wch: 8 },   // ID
      { wch: 40 },  // Tiêu đề
      { wch: 60 },  // Nội dung
      { wch: 20 },  // Loại thông báo
      { wch: 15 },  // Ngày tạo
      { wch: 15 }   // Trạng thái
    ];
    worksheet['!cols'] = columnWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${descriptiveFileName}.xlsx`);

    console.log(`Đã xuất Excel thành công: ${descriptiveFileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất Excel:', error);
    throw new Error('Không thể xuất file Excel. Vui lòng thử lại.');
  }
}

/**
 * Xuất thống kê thông báo ra file Excel
 */
export function exportAnnouncementsStatsToExcel(
  announcements: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    fileName = `thong-ke-thong-bao-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Thống Kê Thông Báo',
    includeHeaders = true
  } = options;

  try {
    // Tính toán thống kê
    const total = announcements.length;
    const active = announcements.filter(a => a.isActive).length;
    const urgent = announcements.filter(a => a.type === 'URGENT').length;
    const news = announcements.filter(a => a.type === 'NEWS').length;
    const regular = announcements.filter(a => a.type === 'REGULAR').length;

    // Dữ liệu thống kê
    const statsData = [
      { 'Chỉ số': 'Tổng số thông báo', 'Giá trị': total },
      { 'Chỉ số': 'Đang hoạt động', 'Giá trị': active },
      { 'Chỉ số': 'Khẩn cấp', 'Giá trị': urgent },
      { 'Chỉ số': 'Tin tức', 'Giá trị': news },
      { 'Chỉ số': 'Thường', 'Giá trị': regular },
      { 'Chỉ số': 'Tỷ lệ hoạt động', 'Giá trị': total > 0 ? `${((active / total) * 100).toFixed(1)}%` : '0%' },
      { 'Chỉ số': 'Tỷ lệ khẩn cấp', 'Giá trị': total > 0 ? `${((urgent / total) * 100).toFixed(1)}%` : '0%' }
    ];

    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    
    // Tạo worksheet từ dữ liệu thống kê
    const worksheet = XLSX.utils.json_to_sheet(statsData);

    // Thiết lập độ rộng cột
    worksheet['!cols'] = [
      { wch: 25 },  // Chỉ số
      { wch: 15 }   // Giá trị
    ];

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Xuất file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    console.log(`Đã xuất thống kê thông báo Excel thành công: ${fileName}.xlsx`);
  } catch (error) {
    console.error('Lỗi khi xuất thống kê thông báo Excel:', error);
    throw new Error('Không thể xuất file thống kê Excel. Vui lòng thử lại.');
  }
}

/**
 * Chuyển đổi loại thông báo sang text tiếng Việt
 */
function getAnnouncementTypeText(type: string): string {
  switch (type) {
    case 'NEWS':
      return 'Tin tức';
    case 'REGULAR':
      return 'Thường';
    case 'URGENT':
      return 'Khẩn cấp';
    default:
      return type || 'Không xác định';
  }
}
