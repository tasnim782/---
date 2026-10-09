import React from 'react';
import { Equipment } from '../types';
import { 
  X, 
  Package, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  CalendarCheck
} from 'lucide-react';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestBorrow: (equipment: Equipment) => void;
  isLoggedIn: boolean;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  isOpen,
  onClose,
  onRequestBorrow,
  isLoggedIn,
}) => {
  if (!isOpen || !equipment) return null;

  const isAvailable = equipment.status === 'available' && equipment.availableQuantity > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn my-6">
        {/* Header Image & Bar */}
        <div className="relative h-60 sm:h-72 bg-slate-100 overflow-hidden">
          {equipment.imageUrl ? (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
              <Package className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-xs"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge over image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-700/90 text-white backdrop-blur-xs">
                {equipment.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-black/40 text-white backdrop-blur-xs border border-white/20">
                {equipment.category}
              </span>
              
              {equipment.status === 'available' ? (
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                  equipment.availableQuantity > 0 
                    ? 'bg-emerald-600/90 text-white' 
                    : 'bg-amber-600/90 text-white'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {equipment.availableQuantity > 0 ? `พร้อมใช้งาน (เหลือ ${equipment.availableQuantity})` : 'ถูกยืมครบแล้ว'}
                </span>
              ) : equipment.status === 'maintenance' ? (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-600/90 text-white flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  กำลังซ่อมบำรุง
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-600/90 text-white flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  งดให้บริการ
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
              {equipment.name}
            </h2>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
          {/* Quick stats pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">คงเหลือพร้อมยืม</span>
              <span className="text-lg font-bold text-emerald-800">
                {equipment.availableQuantity} <span className="text-xs font-normal text-slate-500">/ {equipment.totalQuantity} เครื่อง</span>
              </span>
            </div>
            
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">สถานะปัจจุบัน</span>
              <span className="text-sm font-semibold text-slate-700">
                {equipment.status === 'available' ? 'พร้อมให้บริการ' : equipment.status === 'maintenance' ? 'ซ่อมบำรุง' : 'งดให้บริการ'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-500 block">รหัสประจำอุปกรณ์</span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {equipment.code}
              </span>
            </div>
          </div>

          {/* Description */}
          {equipment.description && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                รายละเอียดและคุณสมบัติ
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                {equipment.description}
              </p>
            </div>
          )}

          {/* Storage Location */}
          {equipment.storageLocation && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-900">สถานที่จัดเก็บ / จุดรับคืน</h5>
                <p className="text-xs text-emerald-800 mt-0.5 font-medium">{equipment.storageLocation}</p>
              </div>
            </div>
          )}

          {/* Accessories */}
          {equipment.accessories && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <Layers className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-800">อุปกรณ์ส่วนควบที่มาในชุด (ต้องคืนครบ)</h5>
                <p className="text-xs text-slate-600 mt-0.5">{equipment.accessories}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ปิดหน้าต่าง
          </button>

          <button
            onClick={() => {
              onClose();
              onRequestBorrow(equipment);
            }}
            disabled={!isAvailable}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>
              {isLoggedIn ? (isAvailable ? 'ส่งคำขอยืมอุปกรณ์นี้' : 'อุปกรณ์นี้ไม่พร้อมให้ยืม') : 'เข้าสู่ระบบเพื่อขอยืม'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
