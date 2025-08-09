import { Resident } from '@/hooks/use-residents';

/**
 * Lấy số CCCD/CMND từ object resident
 * Ưu tiên idCardNumber từ database, fallback về identityNumber
 */
export const getResidentIdCard = (resident: Resident): string => {
  return resident.idCardNumber || resident.identityNumber || '';
};

/**
 * Format số CCCD/CMND cho hiển thị
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard) return 'Chưa cập nhật';
  
  // Nếu là CCCD (12 số), format thành xxx xxx xxx xxx
  if (idCard.length === 12) {
    return idCard.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }
  
  // Nếu là CMND (9 số), format thành xxx xxx xxx
  if (idCard.length === 9) {
    return idCard.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Trả về nguyên bản nếu không match format
  return idCard;
};

/**
 * Kiểm tra tính hợp lệ của số CCCD/CMND
 */
export const validateIdCard = (idCard: string): boolean => {
  // Loại bỏ spaces và kiểm tra
  const cleanIdCard = idCard.replace(/\s/g, '');
  
  // CMND: 9 số hoặc CCCD: 12 số
  return /^\d{9}$/.test(cleanIdCard) || /^\d{12}$/.test(cleanIdCard);
};

/**
 * Clean số CCCD/CMND (loại bỏ spaces)
 */
export const cleanIdCard = (idCard: string): string => {
  return idCard.replace(/\s/g, '');
};

/**
 * Lấy full name an toàn
 */
export const getResidentFullName = (resident: Resident): string => {
  return resident.fullName || 'Chưa cập nhật';
};

/**
 * Mapping các trường có thể có tên khác nhau giữa frontend và backend
 */
export const normalizeResidentData = (data: any): Resident => {
  return {
    id: data.id,
    fullName: data.fullName || data.full_name || '',
    phoneNumber: data.phoneNumber || data.phone_number || '',
    email: data.email || '',
    dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
    gender: data.gender || 'OTHER',
    identityNumber: data.identityNumber || data.identity_number || '',
    idCardNumber: data.idCardNumber || data.id_card_number || '',
    address: data.address || '',
    status: data.status || 'ACTIVE'
  };
};