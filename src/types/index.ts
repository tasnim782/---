export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  studentOrStaffId?: string;
  department?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type EquipmentCategory = 
  | 'กล้องและวิดีโอ'
  | 'ไมโครโฟนและระบบเสียง'
  | 'ขาตั้งกล้องและกิมบอล'
  | 'โปรเจกเตอร์และจอภาพ'
  | 'คอมพิวเตอร์และแท็บเล็ต'
  | 'ไฟและอุปกรณ์สตูดิโอ'
  | 'อุปกรณ์เสริมและอื่นๆ';

export type EquipmentStatus = 'available' | 'maintenance' | 'unavailable';

export interface Equipment {
  id: string;
  code: string;               // รหัสอุปกรณ์ เช่น ED-CAM-001
  name: string;               // ชื่ออุปกรณ์
  category: EquipmentCategory;
  totalQuantity: number;      // จำนวนทั้งหมด
  availableQuantity: number;  // จำนวนคงเหลือพร้อมใช้งาน
  status: EquipmentStatus;    // สถานะอุปกรณ์
  imageUrl: string;
  description: string;        // รายละเอียด สเปก
  storageLocation: string;    // ตู้เก็บ/ห้องเก็บ เช่น ตู้เก็บอุปกรณ์ A1 ห้องปฏิบัติการ 304
  accessories: string;        // อุปกรณ์เสริม เช่น สายชาร์จ แบตเตอรี่ กระเป๋า
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'returned' | 'cancelled';

export type ReturnCondition = 'normal' | 'minor_defect' | 'damaged' | 'missing_accessory' | 'lost';

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  equipmentImageUrl: string;
  category: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userStudentId: string;
  department: string;
  quantity: number;
  borrowDate: string;           // YYYY-MM-DD
  expectedReturnDate: string;   // YYYY-MM-DD
  actualReturnDate?: string | null;
  purpose: string;              // วัตถุประสงค์ในการยืมใช้งาน
  notes?: string;
  status: BookingStatus;
  
  // Admin actions
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  returnedByAdmin?: string | null;
  returnCondition?: ReturnCondition;
  returnNotes?: string | null;
  
  createdAt: string;
  updatedAt: string;
}

export type AdminRoleLevel = 'super_admin' | 'admin' | 'staff';

export interface AdminRecord {
  id: string;
  email: string;
  name?: string;
  roleLevel?: AdminRoleLevel;
  position?: string;
  phoneNumber?: string;
  addedBy: string;
  addedAt: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  adminName: string;
  action: string;
  actionType: 'booking' | 'equipment' | 'admin' | 'return';
  targetTitle: string;
  details: string;
  timestamp: string;
}
