import React, { useState } from 'react';
import { Booking, ReturnCondition } from '../types';
import { recordReturn } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Package, 
  User, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ReturnModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile, currentUser } = useAuth();
  if (!isOpen || !booking) return null;

  const [condition, setCondition] = useState<ReturnCondition>('normal');
  const [restoreStock, setRestoreStock] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const adminIdent = userProfile?.displayName || currentUser?.email || 'Admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      await recordReturn(booking.id, {
        condition,
        notes: notes.trim(),
        adminNameOrEmail: adminIdent,
        restoreStock,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกการคืนอุปกรณ์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                บันทึกการรับคืนอุปกรณ์
              </h3>
              <p className="text-xs text-teal-100 mt-0.5">
                ตรวจสอบสภาพอุปกรณ์และบันทึกประวัติการส่งคืน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-teal-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                {booking.equipmentName} ({booking.equipmentCode})
              </span>
              <span className="text-emerald-800 font-bold">จำนวน: {booking.quantity} ชิ้น</span>
            </div>

            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200 text-[11px]">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ผู้ยืม: {booking.userName} ({booking.userStudentId || booking.userEmail})
              </span>
              <span>โทร: {booking.userPhone}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                เริ่มยืม: {booking.borrowDate}
              </span>
              <span>กำหนดคืน: {booking.expectedReturnDate}</span>
            </div>
          </div>

          {/* Condition Inspection Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              ผลการตรวจรับสภาพอุปกรณ์ *
            </label>
            <div className="space-y-2">
              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  condition === 'normal' 
                    ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="normal"
                  checked={condition === 'normal'}
                  onChange={() => { setCondition('normal'); setRestoreStock(true); }}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    สภาพปกติสมบูรณ์ 100%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    อุปกรณ์ทำงานได้ปกติ ไม่มีรอยเสียหาย อุปกรณ์เสริมครบ
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  condition === 'minor_defect' 
                    ? 'bg-amber-50/70 border-amber-400 text-amber-950 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="minor_defect"
                  checked={condition === 'minor_defect'}
                  onChange={() => setCondition('minor_defect')}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    มีรอยขีดข่วนเล็กน้อย (ยังใช้งานได้ตามปกติ)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    มีตำหนิภายนอกเล็กน้อย แต่ระบบการทำงานยังสมบูรณ์
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  condition === 'damaged' 
                    ? 'bg-rose-50/70 border-rose-400 text-rose-950 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="damaged"
                  checked={condition === 'damaged'}
                  onChange={() => { setCondition('damaged'); setRestoreStock(false); }}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    ชำรุดเสียหาย / ต้องส่งซ่อมบำรุง
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ไม่พร้อมให้ผู้อื่นยืมต่อทันที ต้องตรวจสอบหรือส่งซ่อม
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  condition === 'missing_accessory' 
                    ? 'bg-rose-50/70 border-rose-400 text-rose-950 shadow-xs' 
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="condition"
                  value="missing_accessory"
                  checked={condition === 'missing_accessory'}
                  onChange={() => setCondition('missing_accessory')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    อุปกรณ์ส่วนควบไม่ครบถ้วน
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    เช่น ขาดสายชาร์จ, แบตเตอรี่, หรือกระเป๋า
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Stock Restoration Option */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={restoreStock}
                onChange={(e) => setRestoreStock(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>คืนจำนวน {booking.quantity} เครื่อง กลับเข้าสู่สต็อกพร้อมใช้งานทันที</span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6.5 mt-0.5">
              (หากอุปกรณ์ชำรุดเสียหายและไม่ต้องการให้ผู้อื่นยืม ให้ยกเลิกการติ๊กช่องนี้)
            </p>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              บันทึกหมายเหตุเพิ่มเติม / ข้อเสนอแนะ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ส่งคืนตรงเวลา, สายสัญญาณเปื้อนเล็กน้อย, ทำความสะอาดแล้ว"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-xs text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
            >
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันการรับคืนอุปกรณ์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
