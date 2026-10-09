import React, { useState } from 'react';
import { Booking } from '../types';
import { approveBorrowing } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  CheckCircle2, 
  Package, 
  User, 
  Calendar, 
  Phone, 
  AlertCircle,
  FileText,
  IdCard,
  Building2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ApproveModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingName: string) => void;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userProfile, currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [handoverConfirmed, setHandoverConfirmed] = useState(true);

  if (!isOpen || !booking) return null;

  const adminIdentifier = userProfile?.displayName || currentUser?.email || 'Admin';

  const handleConfirmApprove = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await approveBorrowing(booking.id, adminIdentifier);
      onSuccess(booking.equipmentName);
      onClose();
    } catch (err: any) {
      console.error('Approve error:', err);
      let displayError = 'เกิดข้อผิดพลาดในการอนุมัติการยืม';
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
        displayError = 'สิทธิ์ไม่เพียงพอในการอนุมัติ กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Admin)';
      }
      setErrorMsg(displayError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                อนุมัติการยืมอุปกรณ์
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                ตรวจสอบความถูกต้องและยืนยันการส่งมอบอุปกรณ์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Equipment summary card */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
              {booking.equipmentImageUrl ? (
                <img src={booking.equipmentImageUrl} alt="equip" className="w-full h-full object-cover" />
              ) : (
                <Package className="w-8 h-8 text-slate-400 m-auto mt-4" />
              )}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                {booking.equipmentCode}
              </span>
              <h4 className="font-bold text-sm text-slate-800 truncate" title={booking.equipmentName}>
                {booking.equipmentName}
              </h4>
              <p className="text-xs text-emerald-800 font-semibold">
                จำนวนที่ขอยืม: {booking.quantity} ชิ้น
              </p>
            </div>
          </div>

          {/* Borrower information */}
          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs space-y-2">
            <h5 className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              ข้อมูลผู้ขอยืม
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div className="font-semibold text-slate-900">
                {booking.userName}
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <IdCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>รหัส: {booking.userStudentId || 'ไม่ระบุ'}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>โทร: {booking.userPhone || 'ไม่ระบุ'}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600 truncate">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{booking.department || 'ภาควิชาเทคโนโลยีการศึกษา'}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Purpose */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                เริ่มยืม:
              </span>
              <span className="font-bold text-slate-800">{booking.borrowDate}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="flex items-center gap-1 text-slate-500">
                กำหนดคืน:
              </span>
              <span className="font-bold text-slate-800">{booking.expectedReturnDate}</span>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-600" />
                วัตถุประสงค์ในการยืมใช้งาน:
              </span>
              <p className="text-slate-700 mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                {booking.purpose}
              </p>
            </div>
          </div>

          {/* Handover check */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 cursor-pointer">
            <input
              type="checkbox"
              checked={handoverConfirmed}
              onChange={(e) => setHandoverConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div className="text-xs text-emerald-950 font-medium">
              ยืนยันว่าผู้ขอยืมมารับอุปกรณ์ หรือผ่านการตรวจสอบสิทธิ์เรียบร้อยแล้ว
              <span className="block text-[11px] text-slate-500 mt-0.5 font-normal">
                (การอนุมัติจะตัดจำนวนคงเหลือในคลังทันที {booking.quantity} ชิ้น)
              </span>
            </div>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            onClick={handleConfirmApprove}
            disabled={submitting || !handoverConfirmed}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>กำลังบันทึกการอนุมัติ...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันอนุมัติการยืม</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
