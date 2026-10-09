import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Phone, IdCard, Building2, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateProfileData, isAdmin } = useAuth();
  
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [studentOrStaffId, setStudentOrStaffId] = useState(userProfile?.studentOrStaffId || '');
  const [department, setDepartment] = useState(userProfile?.department || 'ภาควิชาเทคโนโลยีการศึกษา');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await updateProfileData({
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        studentOrStaffId: studentOrStaffId.trim(),
        department: department.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/40"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-2xl">
                {displayName.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                โปรไฟล์ผู้ใช้งาน
                {isAdmin && (
                  <span className="inline-flex items-center text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Admin
                  </span>
                )}
              </h3>
              <p className="text-emerald-100 text-xs flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {userProfile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ระบุชื่อและนามสกุลจริง"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5 text-emerald-600" />
              รหัสนักศึกษา / รหัสอาจารย์-บุคลากร
            </label>
            <input
              type="text"
              value={studentOrStaffId}
              onChange={(e) => setStudentOrStaffId(e.target.value)}
              placeholder="เช่น 6401012345 หรือ STAFF-001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ใช้สำหรับตรวจสอบสิทธิ์ในการเบิกรับอุปกรณ์จริง
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="เช่น 081-234-5678"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              สังกัด / ภาควิชา / คณะ
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="เช่น ภาควิชาเทคโนโลยีการศึกษา คณะศึกษาศาสตร์"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-xs hover:shadow transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
