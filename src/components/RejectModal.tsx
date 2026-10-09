import React, { useState } from 'react';
import { Booking } from '../types';
import { rejectBorrowing } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  XCircle, 
  AlertCircle,
  Package,
  User
} from 'lucide-react';

interface RejectModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingName: string) => void;
}

const REJECT_PRESETS = [
  'อุปกรณ์อยู่ในระหว่างการซ่อมบำรุง หรือยังไม่พร้อมใช้งาน',
  'มีรายการจองซ้ำซ้อนในวันและเวลาดังกล่าว',
  'ข้อมูลผู้ขอยืม หรือวัตถุประสงค์ในการใช้งานไม่ครบถ้วน',
  'ไม่มารับอุปกรณ์ตามกำหนดเวลาที่นัดหมาย',
  'เกินโควตาจำนวนอุปกรณ์ที่สามารถยืมได้พร้อมกัน',
];

export const RejectModal: React.FC<RejectModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [reason, setReason] = useState<string>(REJECT_PRESETS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !booking) return null;

  const adminIdentifier = userProfile?.displayName || currentUser?.email || 'Admin';

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : reason;
    
    if (!finalReason) {
      setErrorMsg('กรุณาระบุเหตุผลในการปฏิเสธคำขอ');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await rejectBorrowing(booking.id, finalReason, adminIdentifier);
      onSuccess(booking.equipmentName);
      onClose();
    } catch (err: any) {
      console.error('Reject error:', err);
      let displayError = 'เกิดข้อผิดพลาดในการปฏิเสธคำขอ';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.error) displayError = parsed.error;
        } catch {
          displayError = err.message;
        }
      } else if (typeof err === 'string') {
        displayError = err;
      }
      if (displayError.includes('permission') || displayError.includes('Missing or insufficient permissions')) {
        displayError = 'สิทธิ์ไม่เพียงพอในการปฏิเสธคำขอ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin)';
      }
      setErrorMsg(displayError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-rose-700 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ปฏิเสธคำขอยืมอุปกรณ์
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                ระบุเหตุผลในการปฏิเสธเพื่อให้ผู้ยืมรับทราบ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-rose-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmReject} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Booking summary */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-500" />
              {booking.equipmentName} ({booking.equipmentCode})
            </div>
            <div className="text-slate-600 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              ผู้ขอยืม: {booking.userName} (จำนวน: {booking.quantity} ชิ้น)
            </div>
          </div>

          {/* Reason Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              เลือกเหตุผลมาตรฐาน:
            </label>
            <div className="space-y-1.5">
              {REJECT_PRESETS.map((p) => (
                <label key={p} className="flex items-start gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="preset_reason"
                    checked={reason === p && !customReason}
                    onChange={() => {
                      setReason(p);
                      setCustomReason('');
                    }}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-700">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หรือระบุเหตุผลเพิ่มเติมเฉพาะกรณี:
            </label>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="พิมพ์เหตุผลที่ต้องการแจ้งผู้ยืม..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/30 text-slate-800"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันการปฏิเสธ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
