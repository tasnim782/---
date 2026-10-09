import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { cancelBooking } from '../services/bookingService';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  AlertCircle, 
  FileText, 
  Package, 
  Undo2,
  AlertTriangle,
  Check,
  ShieldCheck
} from 'lucide-react';

interface MyBookingsProps {
  bookings: Booking[];
  loading: boolean;
  onRefresh?: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ bookings, loading }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Today string for overdue check
  const todayStr = new Date().toISOString().split('T')[0];

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancellingId(bookingToCancel.id);
    try {
      await cancelBooking(bookingToCancel.id);
      setBookingToCancel(null);
    } catch (err) {
      console.error('Cancel booking error:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return b.status === 'pending' || b.status === 'approved';
    return b.status === filterStatus;
  });

  const getStatusBadge = (b: Booking) => {
    const isOverdue = b.status === 'approved' && b.expectedReturnDate < todayStr;

    switch (b.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            รอเจ้าหน้าที่อนุมัติ
          </span>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              อนุมัติแล้ว / กำลังยืม
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                เกินกำหนดส่งคืน!
              </span>
            )}
          </div>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
            <Check className="w-3.5 h-3.5" />
            คืนอุปกรณ์เรียบร้อย
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            ถูกปฏิเสธคำขอ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
            ยกเลิกแล้ว
          </span>
        );
      default:
        return null;
    }
  };

  const getConditionLabel = (condition?: string) => {
    switch (condition) {
      case 'normal':
        return <span className="text-emerald-700 font-semibold">สภาพปกติสมบูรณ์ 100%</span>;
      case 'minor_defect':
        return <span className="text-amber-700 font-semibold">มีรอยขีดข่วนเล็กน้อย</span>;
      case 'damaged':
        return <span className="text-rose-700 font-semibold">ชำรุดเสียหาย / ต้องส่งซ่อม</span>;
      case 'missing_accessory':
        return <span className="text-rose-700 font-semibold">อุปกรณ์ส่วนควบไม่ครบถ้วน</span>;
      case 'lost':
        return <span className="text-rose-800 font-bold">สูญหาย</span>;
      default:
        return <span className="text-slate-500">ตรวจสอบเรียบร้อย</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            รายการจองของฉัน (My Bookings)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามสถานะคำขอยืม การอนุมัติ และประวัติการคืนอุปกรณ์ของคุณ
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            รออนุมัติ ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'approved'
                ? 'bg-emerald-800 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            กำลังยืม ({bookings.filter(b => b.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('returned')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterStatus === 'returned'
                ? 'bg-teal-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            คืนแล้ว ({bookings.filter(b => b.status === 'returned').length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 text-slate-500 text-sm">
          กำลังโหลดประวัติการจอง...
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isPending = b.status === 'pending';
            const isApproved = b.status === 'approved';
            const isReturned = b.status === 'returned';
            const isRejected = b.status === 'rejected';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200 transition-all overflow-hidden p-5 sm:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Equipment summary & Image */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {b.equipmentImageUrl ? (
                        <img
                          src={b.equipmentImageUrl}
                          alt={b.equipmentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {b.equipmentCode}
                        </span>
                        <span className="text-xs text-slate-500">
                          {b.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">
                        {b.equipmentName}
                      </h3>

                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span>จำนวนที่ยืม: <strong className="text-emerald-800">{b.quantity} ชิ้น</strong></span>
                        <span>•</span>
                        <span>ยื่นคำขอเมื่อ: {new Date(b.createdAt).toLocaleDateString('th-TH')}</span>
                      </div>

                      {/* Purpose */}
                      <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                        <strong className="text-slate-700">วัตถุประสงค์: </strong>
                        {b.purpose}
                      </p>
                    </div>
                  </div>

                  {/* Status & Schedule Info */}
                  <div className="md:w-72 shrink-0 md:text-right space-y-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex md:justify-end">
                      {getStatusBadge(b)}
                    </div>

                    {/* Dates block */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 text-left">
                      <div className="flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          วันที่เริ่มยืม:
                        </span>
                        <span className="font-semibold text-slate-800">
                          {b.borrowDate}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          กำหนดคืน:
                        </span>
                        <span className={`font-semibold ${
                          b.status === 'approved' && b.expectedReturnDate < todayStr
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-800'
                        }`}>
                          {b.expectedReturnDate}
                        </span>
                      </div>
                      {b.actualReturnDate && (
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-emerald-800 font-medium">คืนจริงเมื่อ:</span>
                          <span className="font-bold text-emerald-800">
                            {new Date(b.actualReturnDate).toLocaleDateString('th-TH')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions if pending */}
                    {isPending && (
                      <div className="flex md:justify-end">
                        <button
                          type="button"
                          onClick={() => setBookingToCancel(b)}
                          disabled={cancellingId === b.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          <span>{cancellingId === b.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำขอนี้'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Feedback & Admin notes */}
                {isReturned && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-teal-50/50 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-700" />
                      <span className="font-bold text-teal-900">ผลการตรวจสอบสภาพอุปกรณ์ตอนคืน:</span>
                      {getConditionLabel(b.returnCondition)}
                    </div>
                    {b.returnNotes && (
                      <p className="text-slate-600 text-[11px] pl-6">
                        บันทึกเจ้าหน้าที่: {b.returnNotes}
                      </p>
                    )}
                  </div>
                )}

                {isRejected && b.rejectionReason && (
                  <div className="mt-4 pt-3 border-t border-slate-100 bg-rose-50/50 p-3 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-900">เหตุผลที่ปฏิเสธ:</span>
                      <p className="text-rose-700 text-xs mt-0.5">{b.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Clock className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">ไม่พบรายการจองอุปกรณ์</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            คุณยังไม่มีรายการขอยืมอุปกรณ์ในหมวดหมู่นี้ คุณสามารถเลือกดูและส่งคำขอยืมอุปกรณ์ได้จากหน้าแคตตาล็อก
          </p>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Undo2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">ยืนยันการยกเลิกคำขอ</h4>
              <p className="text-xs text-slate-500">
                คุณต้องการยกเลิกคำขอจอง <strong className="text-slate-800">"{bookingToCancel.equipmentName}"</strong> ใช่หรือไม่?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                disabled={cancellingId === bookingToCancel.id}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancellingId === bookingToCancel.id}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                {cancellingId === bookingToCancel.id ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกคำขอ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
