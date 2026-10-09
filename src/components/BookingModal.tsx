import React, { useState } from 'react';
import { Equipment, UserProfile } from '../types';
import { submitBookingRequest } from '../services/bookingService';
import { 
  X, 
  Calendar, 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Phone, 
  IdCard,
  User,
  Info
} from 'lucide-react';

interface BookingModalProps {
  equipment: Equipment | null;
  userProfile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  equipment,
  userProfile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !equipment || !userProfile) return null;

  // Format today's date YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [borrowDate, setBorrowDate] = useState<string>(todayStr);
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(tomorrowStr);
  const [purpose, setPurpose] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Borrower contact details
  const [phone, setPhone] = useState<string>(userProfile.phoneNumber || '');
  const [studentId, setStudentId] = useState<string>(userProfile.studentOrStaffId || '');
  const [department, setDepartment] = useState<string>(userProfile.department || 'ภาควิชาเทคโนโลยีการศึกษา');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const maxAvailable = Math.max(0, equipment.availableQuantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (quantity < 1 || quantity > maxAvailable) {
      setErrorMsg(`กรุณาระบุจำนวนระหว่าง 1 ถึง ${maxAvailable} ชิ้น`);
      return;
    }

    if (!borrowDate || !expectedReturnDate) {
      setErrorMsg('กรุณาระบุวันที่ยืมและวันที่กำหนดคืนให้ครบถ้วน');
      return;
    }

    if (expectedReturnDate < borrowDate) {
      setErrorMsg('วันที่กำหนดคืนต้องไม่น้อยกว่าวันที่เริ่มยืม');
      return;
    }

    if (!purpose.trim()) {
      setErrorMsg('กรุณาระบุวัตถุประสงค์ในการยืมใช้งาน');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('กรุณาระบุเบอร์โทรศัพท์ติดต่อสำหรับรับอุปกรณ์');
      return;
    }

    setSubmitting(true);
    try {
      await submitBookingRequest({
        equipmentId: equipment.id,
        equipmentCode: equipment.code,
        equipmentName: equipment.name,
        equipmentImageUrl: equipment.imageUrl,
        category: equipment.category,
        userId: userProfile.uid,
        userName: userProfile.displayName || 'ผู้ใช้งาน',
        userEmail: userProfile.email,
        userPhone: phone.trim(),
        userStudentId: studentId.trim(),
        department: department.trim(),
        quantity: Number(quantity),
        borrowDate,
        expectedReturnDate,
        purpose: purpose.trim(),
        notes: notes.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-100">
                ส่งคำขอยืมอุปกรณ์
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {equipment.name}
              </h3>
              <p className="text-xs text-emerald-200">
                รหัส: {equipment.code} | หมวดหมู่: {equipment.category}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick stock status badge */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>สถานะในคลังอุปกรณ์:</span>
            </div>
            <div className="font-semibold text-emerald-800">
              พร้อมให้ยืม {maxAvailable} จากทั้งหมด {equipment.totalQuantity} ชิ้น
            </div>
          </div>

          {/* Quantity and Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนที่ต้องการยืม *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={maxAvailable}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxAvailable, Number(e.target.value))))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm font-semibold"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">ชิ้น</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                วันที่เริ่มยืม *
              </label>
              <input
                type="date"
                min={todayStr}
                required
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                กำหนดคืน *
              </label>
              <input
                type="date"
                min={borrowDate || todayStr}
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Purpose of borrowing */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              วัตถุประสงค์ในการยืมใช้งาน *
            </label>
            <textarea
              required
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="เช่น ถ่ายทำวิดีโอเพื่อการศึกษาวิชา ED305, กิจกรรมค่ายอาสาพัฒนาการศึกษา, บันทึกเทปการสอน"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Borrower Information Section */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              ข้อมูลผู้ขอยืมอุปกรณ์
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  เบอร์โทรศัพท์ติดต่อ *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <IdCard className="w-3 h-3 text-emerald-600" />
                  รหัสนักศึกษา / รหัสอาจารย์
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 6401051234"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ขอรับอุปกรณ์ช่วงเช้า 09:00 น., ขอเพิ่มสายต่อยาว"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
            />
          </div>

          {/* Terms note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">เงื่อนไขการยืม:</span> ผู้ยืมต้องนำบัตรนักศึกษา/บัตรประชาชนมาแสดงขณะรับอุปกรณ์ ณ ภาควิชาเทคโนโลยีการศึกษา และต้องดูแลรักษาอุปกรณ์ให้อยู่ในสภาพสมบูรณ์ หากเกิดการชำรุดเสียหายหรือสูญหาย ผู้ยืมต้องรับผิดชอบตามระเบียบของภาควิชาฯ
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || maxAvailable === 0}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <span>กำลังบันทึกคำขอ...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันการส่งคำขอจอง</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
