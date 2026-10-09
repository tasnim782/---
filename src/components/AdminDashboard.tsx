import React, { useState, useEffect } from 'react';
import { 
  Equipment, 
  Booking, 
  AdminRecord, 
  EquipmentCategory 
} from '../types';
import { 
  approveBorrowing, 
  rejectBorrowing, 
  deleteBooking 
} from '../services/bookingService';
import { 
  deleteEquipment, 
  seedInitialEquipment, 
  updateEquipment 
} from '../services/equipmentService';
import { useAuth } from '../context/AuthContext';
import { EquipmentFormModal } from './EquipmentFormModal';
import { ReturnModal } from './ReturnModal';
import { ApproveModal } from './ApproveModal';
import { RejectModal } from './RejectModal';
import { AdminManagementPanel } from './AdminManagementPanel';
import { 
  BarChart3, 
  Package, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  UserCheck, 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Phone, 
  FileText,
  XCircle,
  ExternalLink,
  Layers,
  MapPin,
  Check,
  KeyRound
} from 'lucide-react';

interface AdminDashboardProps {
  equipmentList: Equipment[];
  bookingsList: Booking[];
  loadingEquipment: boolean;
  loadingBookings: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  equipmentList,
  bookingsList,
  loadingEquipment,
  loadingBookings,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'equipment' | 'admins'>('overview');

  // Sub-filter for requests tab
  const [requestFilter, setRequestFilter] = useState<'pending' | 'approved' | 'history'>('pending');

  // Equipment Form modal state
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState<Equipment | null>(null);

  // Return modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState<Booking | null>(null);

  // Approve modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedBookingForApprove, setSelectedBookingForApprove] = useState<Booking | null>(null);

  // Reject modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedBookingForReject, setSelectedBookingForReject] = useState<Booking | null>(null);

  // Delete equipment confirmation
  const [itemToDelete, setItemToDelete] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState(false);

  // Seed sample data confirmation
  const [showSeedDialog, setShowSeedDialog] = useState(false);

  // Equipment search & filter
  const [searchEquip, setSearchEquip] = useState('');
  const [filterEquipCat, setFilterEquipCat] = useState<string>('all');

  // Request action loading
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [dashboardNotice, setDashboardNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const adminIdentifier = userProfile?.displayName || currentUser?.email || 'Admin';
  const todayStr = new Date().toISOString().split('T')[0];

  const triggerNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setDashboardNotice({ text, type });
    setTimeout(() => setDashboardNotice(null), 4000);
  };

  // Open Approve Modal (allows review of borrower details and handover confirmation)
  const handleOpenApprove = (booking: Booking) => {
    setSelectedBookingForApprove(booking);
    setIsApproveModalOpen(true);
  };

  // Open Reject Modal
  const handleOpenReject = (booking: Booking) => {
    setSelectedBookingForReject(booking);
    setIsRejectModalOpen(true);
  };

  // Quick Direct Approve (safe without window.confirm)
  const handleQuickApprove = async (booking: Booking, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProcessingBookingId(booking.id);
    try {
      await approveBorrowing(booking.id, adminIdentifier);
      triggerNotice(`อนุมัติการยืม "${booking.equipmentName}" ให้แก่ ${booking.userName} เรียบร้อยแล้ว (ตัดสต็อก ${booking.quantity} ชิ้น)`, 'success');
    } catch (err: any) {
      console.error('Quick approve error:', err);
      let msg = 'ไม่สามารถอนุมัติได้';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) msg = parsed.error;
        } catch {
          msg = err.message;
        }
      }
      if (msg.includes('permission') || msg.includes('Missing or insufficient permissions')) {
        msg = 'สิทธิ์ไม่เพียงพอในการอนุมัติ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin)';
      }
      triggerNotice(msg, 'error');
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Confirm delete equipment
  const handleConfirmDeleteEquipment = async () => {
    if (!itemToDelete) return;
    setDeletingEquipment(true);
    try {
      await deleteEquipment(itemToDelete.id);
      triggerNotice(`ลบอุปกรณ์ "${itemToDelete.name}" ออกจากระบบเรียบร้อยแล้ว`, 'success');
      setItemToDelete(null);
    } catch (err: any) {
      triggerNotice(`ลบอุปกรณ์ไม่สำเร็จ: ${err.message}`, 'error');
    } finally {
      setDeletingEquipment(false);
    }
  };

  // Confirm seed equipment
  const handleConfirmSeed = async () => {
    setShowSeedDialog(false);
    setSeedingLoading(true);
    try {
      const count = await seedInitialEquipment();
      if (count > 0) {
        triggerNotice(`เพิ่มอุปกรณ์ตัวอย่างสำเร็จจำนวน ${count} รายการ!`, 'success');
      } else {
        triggerNotice('มีข้อมูลอุปกรณ์ในระบบอยู่แล้ว', 'success');
      }
    } catch (err: any) {
      triggerNotice(`เกิดข้อผิดพลาด: ${err.message}`, 'error');
    } finally {
      setSeedingLoading(false);
    }
  };

  // KPI Calculations
  const totalEquipCount = equipmentList.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
  const totalAvailableCount = equipmentList.reduce((acc, curr) => acc + (curr.availableQuantity || 0), 0);
  const totalBorrowedCount = Math.max(0, totalEquipCount - totalAvailableCount);
  
  const pendingRequests = bookingsList.filter(b => b.status === 'pending');
  const activeBorrowings = bookingsList.filter(b => b.status === 'approved');
  const returnedHistory = bookingsList.filter(b => b.status === 'returned');

  // Filtered equipment list for admin tab
  const filteredAdminEquip = equipmentList.filter((item) => {
    if (filterEquipCat !== 'all' && item.category !== filterEquipCat) return false;
    if (searchEquip.trim()) {
      const q = searchEquip.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.storageLocation?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Seed Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800">
              ระบบจัดการสำหรับผู้ดูแลระบบ (Admin Dashboard)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            จัดการรายการอุปกรณ์ อนุมัติการยืม ตรวจรับการคืน และควบคุมสิทธิ์ผู้ดูแลระบบ
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          {equipmentList.length === 0 && (
            <button
              onClick={() => setShowSeedDialog(true)}
              disabled={seedingLoading}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{seedingLoading ? 'กำลังสร้างข้อมูล...' : 'เพิ่มอุปกรณ์ตัวอย่างภาควิชาฯ'}</span>
            </button>
          )}

          <button
            onClick={() => {
              setSelectedEquipmentForEdit(null);
              setIsEquipmentModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มอุปกรณ์ใหม่</span>
          </button>
        </div>
      </div>

      {dashboardNotice && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn shadow-xs border ${
          dashboardNotice.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {dashboardNotice.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className="font-medium">{dashboardNotice.text}</span>
        </div>
      )}

      {/* Main Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-600" />
          <span>สรุปภาพรวม</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-emerald-600" />
          <span>การจัดการคำขอยืม-คืน</span>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'equipment'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-600" />
          <span>จัดการอุปกรณ์ ({equipmentList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'admins'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>ระบบจัดการแอดมินและผู้ใช้งาน</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium text-slate-500">อุปกรณ์ทั้งหมดในระบบ</span>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {totalEquipCount} <span className="text-xs font-normal text-slate-400">ชิ้น ({equipmentList.length} รายการ)</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                พร้อมให้ยืม {totalAvailableCount} ชิ้น
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium text-slate-500">อุปกรณ์ที่ถูกยืมอยู่</span>
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-900">
                {activeBorrowings.reduce((sum, b) => sum + b.quantity, 0)} <span className="text-xs font-normal text-slate-400">ชิ้น</span>
              </div>
              <p className="text-[11px] text-slate-500">
                จาก {activeBorrowings.length} รายการที่กำลังใช้งาน
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium text-slate-500">คำขอรออนุมัติ</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
                {pendingRequests.length} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {pendingRequests.length > 0 ? 'ต้องตรวจสอบและอนุมัติ' : 'ไม่มีรายการค้างตรวจสอบ'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium text-slate-500">ประวัติส่งคืนสำเร็จ</span>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800">
                {returnedHistory.length} <span className="text-xs font-normal text-slate-400">ครั้ง</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                คืนเรียบร้อยเข้าสู่สต็อก
              </p>
            </div>
          </div>

          {/* Pending Requests Quick Action Box */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>มีรายการขอยืมที่รอการอนุมัติ {pendingRequests.length} รายการ</span>
                </div>
                <button
                  onClick={() => { setActiveTab('requests'); setRequestFilter('pending'); }}
                  className="text-xs font-semibold text-amber-800 underline hover:text-amber-950"
                >
                  ดูทั้งหมด
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingRequests.slice(0, 4).map((p) => (
                  <div key={p.id} className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                    <div className="truncate">
                      <div className="font-bold text-slate-800 text-xs truncate">
                        {p.equipmentName} ({p.equipmentCode})
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ผู้ยืม: {p.userName} | จำนวน: {p.quantity} ชิ้น
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenApprove(p)}
                      disabled={processingBookingId === p.id}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติ</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Distribution Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-700" />
              สรุปจำนวนอุปกรณ์แยกตามหมวดหมู่
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {['กล้องและวิดีโอ', 'ไมโครโฟนและระบบเสียง', 'ขาตั้งกล้องและกิมบอล', 'โปรเจกเตอร์และจอภาพ', 'คอมพิวเตอร์และแท็บเล็ต', 'ไฟและอุปกรณ์สตูดิโอ', 'อุปกรณ์เสริมและอื่นๆ'].map((cat) => {
                const itemsInCat = equipmentList.filter(e => e.category === cat);
                const totalInCat = itemsInCat.reduce((sum, e) => sum + e.totalQuantity, 0);
                const availInCat = itemsInCat.reduce((sum, e) => sum + e.availableQuantity, 0);

                return (
                  <div key={cat} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 text-xs block">{cat}</span>
                      <span className="text-[11px] text-slate-500">{itemsInCat.length} รายการ</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-800">{availInCat}</span>
                      <span className="text-xs text-slate-400"> / {totalInCat} ชิ้น</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUESTS MANAGEMENT */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Sub-tabs for requests */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setRequestFilter('pending')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
                  requestFilter === 'pending'
                    ? 'bg-amber-500 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                รออนุมัติ ({pendingRequests.length})
              </button>
              <button
                onClick={() => setRequestFilter('approved')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
                  requestFilter === 'approved'
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                กำลังยืมอยู่ ({activeBorrowings.length})
              </button>
              <button
                onClick={() => setRequestFilter('history')}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all ${
                  requestFilter === 'history'
                    ? 'bg-teal-800 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                ประวัติการคืน / ปฏิเสธ ({returnedHistory.length + bookingsList.filter(b => b.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Pending Sub-list */}
          {requestFilter === 'pending' && (
            <div className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Equipment info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {b.equipmentImageUrl ? (
                            <img src={b.equipmentImageUrl} alt="equip" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-slate-300 m-auto mt-4" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {b.equipmentCode}
                            </span>
                            <span className="text-xs text-slate-500">{b.category}</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              รออนุมัติ
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base">{b.equipmentName}</h4>
                          <div className="text-xs text-slate-600">
                            จำนวนที่ขอยืม: <strong className="text-emerald-800 font-bold">{b.quantity} ชิ้น</strong>
                          </div>
                        </div>
                      </div>

                      {/* Borrower info */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1 lg:w-72 shrink-0">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                          {b.userName}
                        </div>
                        <div className="text-slate-600">
                          {b.userStudentId && `รหัส: ${b.userStudentId} | `}
                          {b.department || 'ภาควิชาเทคโนโลยีการศึกษา'}
                        </div>
                        <div className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {b.userPhone || 'ไม่มีเบอร์โทร'}
                        </div>
                        <div className="text-slate-500 text-[11px]">{b.userEmail}</div>
                      </div>
                    </div>

                    {/* Dates & Purpose */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[11px]">ช่วงวันที่ยืม-คืน</span>
                        <span className="font-semibold text-slate-800">{b.borrowDate} ถึง {b.expectedReturnDate}</span>
                      </div>

                      <div className="md:col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[11px]">วัตถุประสงค์การยืม</span>
                        <span className="text-slate-700 font-medium">{b.purpose}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-end flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleOpenReject(b)}
                        disabled={processingBookingId === b.id}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                      >
                        ปฏิเสธคำขอ
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQuickApprove(b, e)}
                        disabled={processingBookingId === b.id}
                        className="px-3.5 py-2 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        title="อนุมัติทันทีและตัดสต็อกในคลิกเดียว"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{processingBookingId === b.id ? 'กำลังอนุมัติ...' : 'อนุมัติทันที'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenApprove(b)}
                        disabled={processingBookingId === b.id}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>อนุมัติการยืม (ตรวจสอบ & ส่งมอบ)</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 text-slate-500 text-xs">
                  ไม่มีรายการคำขอยืมที่รอการอนุมัติในขณะนี้
                </div>
              )}
            </div>
          )}

          {/* Active Borrowings Sub-list */}
          {requestFilter === 'approved' && (
            <div className="space-y-3">
              {activeBorrowings.length > 0 ? (
                activeBorrowings.map((b) => {
                  const isOverdue = b.expectedReturnDate < todayStr;
                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {b.equipmentImageUrl ? (
                              <img src={b.equipmentImageUrl} alt="equip" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-8 h-8 text-slate-300 m-auto mt-4" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                                {b.equipmentCode}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                กำลังยืมอยู่
                              </span>
                              {isOverdue && (
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white animate-pulse">
                                  เกินกำหนดคืน!
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-900 text-base">{b.equipmentName}</h4>
                            <div className="text-xs text-slate-600">
                              จำนวน: <strong className="text-emerald-800 font-bold">{b.quantity} ชิ้น</strong> | 
                              เริ่มยืม: {b.borrowDate} | 
                              กำหนดคืน: <span className={isOverdue ? 'text-rose-600 font-bold' : 'font-semibold'}>{b.expectedReturnDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Borrower contact */}
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1 lg:w-72 shrink-0">
                          <div className="font-bold text-slate-800">{b.userName}</div>
                          <div className="text-slate-600">รหัส: {b.userStudentId || '-'} | โทร: {b.userPhone}</div>
                          <div className="text-[11px] text-slate-500">{b.department}</div>
                        </div>
                      </div>

                      {/* Return Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-500">
                          อนุมัติโดย: {b.approvedBy || 'เจ้าหน้าที่'} เมื่อ {b.approvedAt ? new Date(b.approvedAt).toLocaleDateString('th-TH') : '-'}
                        </div>

                        <button
                          onClick={() => {
                            setSelectedBookingForReturn(b);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>บันทึกการรับคืนอุปกรณ์</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 text-slate-500 text-xs">
                  ไม่มีอุปกรณ์ที่กำลังถูกยืมอยู่ในขณะนี้
                </div>
              )}
            </div>
          )}

          {/* History Sub-list */}
          {requestFilter === 'history' && (
            <div className="space-y-3">
              {bookingsList.filter(b => b.status === 'returned' || b.status === 'rejected').map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{b.equipmentCode}</span>
                      <span className="font-semibold text-slate-900">{b.equipmentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        b.status === 'returned' ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {b.status === 'returned' ? 'คืนแล้ว' : 'ถูกปฏิเสธ'}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1">
                      ผู้ยืม: {b.userName} ({b.userStudentId || b.userPhone}) | จำนวน: {b.quantity} ชิ้น | ยืม: {b.borrowDate} - {b.expectedReturnDate}
                    </div>
                    {b.status === 'returned' && (
                      <div className="text-emerald-800 font-medium text-[11px] mt-0.5">
                        สภาพอุปกรณ์: {b.returnCondition || 'ปกติ'} {b.returnNotes && `(${b.returnNotes})`}
                      </div>
                    )}
                    {b.status === 'rejected' && (
                      <div className="text-rose-700 text-[11px] mt-0.5">
                        เหตุผล: {b.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="text-slate-400 text-[11px] shrink-0 text-right">
                    อัปเดตเมื่อ: {new Date(b.updatedAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EQUIPMENT MANAGEMENT (CRUD) */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          {/* Search & Filter row */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchEquip}
                onChange={(e) => setSearchEquip(e.target.value)}
                placeholder="ค้นหารหัส, ชื่ออุปกรณ์, หรือตู้เก็บ..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterEquipCat}
                onChange={(e) => setFilterEquipCat(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700"
              >
                <option value="all">ทุกหมวดหมู่</option>
                <option value="กล้องและวิดีโอ">กล้องและวิดีโอ</option>
                <option value="ไมโครโฟนและระบบเสียง">ไมโครโฟนและระบบเสียง</option>
                <option value="ขาตั้งกล้องและกิมบอล">ขาตั้งกล้องและกิมบอล</option>
                <option value="โปรเจกเตอร์และจอภาพ">โปรเจกเตอร์และจอภาพ</option>
                <option value="คอมพิวเตอร์และแท็บเล็ต">คอมพิวเตอร์และแท็บเล็ต</option>
                <option value="ไฟและอุปกรณ์สตูดิโอ">ไฟและอุปกรณ์สตูดิโอ</option>
                <option value="อุปกรณ์เสริมและอื่นๆ">อุปกรณ์เสริมและอื่นๆ</option>
              </select>

              <button
                onClick={() => {
                  setSelectedEquipmentForEdit(null);
                  setIsEquipmentModalOpen(true);
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มอุปกรณ์</span>
              </button>
            </div>
          </div>

          {/* Equipment Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">อุปกรณ์</th>
                    <th className="py-3.5 px-4">หมวดหมู่</th>
                    <th className="py-3.5 px-4 text-center">คงเหลือ / ทั้งหมด</th>
                    <th className="py-3.5 px-4">สถานที่จัดเก็บ</th>
                    <th className="py-3.5 px-4">สถานะ</th>
                    <th className="py-3.5 px-4 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminEquip.length > 0 ? (
                    filteredAdminEquip.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-6 h-6 text-slate-300 m-auto mt-3" />
                              )}
                            </div>
                            <div>
                              <div className="font-mono font-bold text-slate-800">{item.code}</div>
                              <div className="font-semibold text-slate-900 max-w-xs truncate" title={item.name}>
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {item.category}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-emerald-800 text-sm">
                            {item.availableQuantity}
                          </span>
                          <span className="text-slate-400"> / {item.totalQuantity}</span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={item.storageLocation}>
                          {item.storageLocation || '-'}
                        </td>

                        <td className="py-3.5 px-4">
                          {item.status === 'available' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                              พร้อมใช้งาน
                            </span>
                          ) : item.status === 'maintenance' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">
                              ซ่อมบำรุง
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700">
                              งดให้บริการ
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedEquipmentForEdit(item);
                                setIsEquipmentModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="แก้ไขข้อมูล"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบอุปกรณ์"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        ไม่พบรายการอุปกรณ์ตามเงื่อนไขที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMPREHENSIVE ADMIN & USER MANAGEMENT */}
      {activeTab === 'admins' && (
        <AdminManagementPanel />
      )}

      {/* Equipment Form Modal */}
      <EquipmentFormModal
        isOpen={isEquipmentModalOpen}
        onClose={() => {
          setIsEquipmentModalOpen(false);
          setSelectedEquipmentForEdit(null);
        }}
        onSuccess={() => {
          setIsEquipmentModalOpen(false);
          setSelectedEquipmentForEdit(null);
        }}
        equipmentToEdit={selectedEquipmentForEdit}
      />

      {/* Approve Modal */}
      <ApproveModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedBookingForApprove(null);
        }}
        onSuccess={(equipName) => {
          triggerNotice(`อนุมัติการยืม "${equipName}" สำเร็จเรียบร้อยแล้ว`, 'success');
        }}
        booking={selectedBookingForApprove}
      />

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedBookingForReject(null);
        }}
        onSuccess={(equipName) => {
          triggerNotice(`ปฏิเสธคำขอยืม "${equipName}" เรียบร้อยแล้ว`, 'success');
        }}
        booking={selectedBookingForReject}
      />

      {/* Return Inspection Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedBookingForReturn(null);
        }}
        onSuccess={() => {
          triggerNotice('บันทึกการส่งคืนอุปกรณ์และอัปเดตสต็อกเรียบร้อยแล้ว', 'success');
        }}
        booking={selectedBookingForReturn}
      />

      {/* Delete Equipment Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">ยืนยันการลบอุปกรณ์</h4>
              <p className="text-xs text-slate-500">
                คุณแน่ใจหรือไม่ว่าต้องการลบ <strong className="text-slate-800">"{itemToDelete.name}"</strong> ({itemToDelete.code}) ออกจากระบบ? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={deletingEquipment}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEquipment}
                disabled={deletingEquipment}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                {deletingEquipment ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seed Confirmation Modal */}
      {showSeedDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">เพิ่มข้อมูลอุปกรณ์ตัวอย่าง</h4>
              <p className="text-xs text-slate-500">
                ระบบจะสร้างรายการอุปกรณ์เทคโนโลยีการศึกษามาตรฐาน เช่น กล้อง Sony, Panasonic, ไมค์ไร้สาย Rode, กิมบอล DJI และโปรเจกเตอร์ Epson ลงในฐานข้อมูล
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSeedDialog(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmSeed}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                ยืนยันเพิ่มข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
