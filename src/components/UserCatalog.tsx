import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentCategory } from '../types';
import { SystemLogo } from './SystemLogo';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  CalendarCheck, 
  Package, 
  Camera, 
  Mic, 
  Maximize2,
  Sparkles,
  MapPin,
  HelpCircle,
  Clock,
  IdCard,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

interface UserCatalogProps {
  equipmentList: Equipment[];
  onSelectDetail: (equipment: Equipment) => void;
  onRequestBorrow: (equipment: Equipment) => void;
  isLoggedIn: boolean;
  onLoginPrompt: () => void;
}

const CATEGORIES: (EquipmentCategory | 'ทั้งหมด')[] = [
  'ทั้งหมด',
  'กล้องและวิดีโอ',
  'ไมโครโฟนและระบบเสียง',
  'ขาตั้งกล้องและกิมบอล',
  'โปรเจกเตอร์และจอภาพ',
  'คอมพิวเตอร์และแท็บเล็ต',
  'ไฟและอุปกรณ์สตูดิโอ',
  'อุปกรณ์เสริมและอื่นๆ',
];

export const UserCatalog: React.FC<UserCatalogProps> = ({
  equipmentList,
  onSelectDetail,
  onRequestBorrow,
  isLoggedIn,
  onLoginPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'ทั้งหมด'>('ทั้งหมด');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showBorrowSteps, setShowBorrowSteps] = useState(false);

  // Filtered equipment list
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ทั้งหมด' && item.category !== selectedCategory) {
        return false;
      }

      // Available filter
      if (onlyAvailable && (item.availableQuantity <= 0 || item.status !== 'available')) {
        return false;
      }

      // Search query filter (matches name, code, description, or storage location)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchLoc = item.storageLocation?.toLowerCase().includes(query);
        return matchName || matchCode || matchDesc || matchLoc;
      }

      return true;
    });
  }, [equipmentList, selectedCategory, onlyAvailable, searchQuery]);

  // Total available stock calculation
  const totalAvailableCount = useMemo(() => {
    return equipmentList.reduce((sum, item) => sum + (item.availableQuantity || 0), 0);
  }, [equipmentList]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>ภาควิชาเทคโนโลยีการศึกษา คณะศึกษาศาสตร์</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            ระบบยืม-คืนอุปกรณ์สื่อโสตทัศนูปกรณ์
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            บริการยืมอุปกรณ์กล้อง อุปกรณ์บันทึกเสียง ไฟสตูดิโอ และเครื่องฉาย สำหรับนักศึกษาและอาจารย์ เพื่อใช้ในงานผลิตสื่อนวัตกรรมการศึกษาและการเรียนการสอน
          </p>

          {/* Quick User Highlights */}
          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-emerald-200">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              พร้อมให้ยืม {totalAvailableCount} ชิ้นในคลัง
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              จุดรับคืน: ห้องปฏิบัติการ 304
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              บริการ 08:30 - 16:30 น.
            </span>
          </div>
        </div>

        {/* Decorative emblem */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center">
          <div className="w-52 h-52 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/10 hover:scale-105 transition-transform duration-300">
            <SystemLogo size="100%" variant="full" />
          </div>
        </div>
      </div>

      {/* Student/User Step-by-Step Guide Toggle Card */}
      <div className="bg-white rounded-2xl border border-emerald-100 shadow-xs overflow-hidden">
        <button
          onClick={() => setShowBorrowSteps(!showBorrowSteps)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                ขั้นตอนการยืม-คืนอุปกรณ์สื่อโสตทัศนูปกรณ์ สำหรับนักศึกษาและอาจารย์
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 hidden sm:inline-block">
                  4 ขั้นตอนง่ายๆ
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {showBorrowSteps ? 'คลิกเพื่อย่อข้อมูลคำแนะนำ' : 'คลิกเพื่อดูขั้นตอนและระเบียบปฏิบัติในการขอยืมอุปกรณ์'}
              </p>
            </div>
          </div>
          <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            {showBorrowSteps ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showBorrowSteps && (
          <div className="px-5 pb-6 pt-1 border-t border-slate-100 bg-slate-50/40 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-800">
                  เลือกอุปกรณ์ในแคตตาล็อก
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  ค้นหาอุปกรณ์ที่ต้องการ ตรวจสอบสถานะความพร้อม และจำนวนคงเหลือในคลัง
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="font-bold text-xs text-slate-800">
                  ส่งคำขอยืมออนไลน์
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  กำหนดวันที่ต้องการยืม วันที่คืน ระบุจำนวน และวัตถุประสงค์ในการนำไปใช้งาน
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="font-bold text-xs text-slate-800">
                  รออนุมัติและรับอุปกรณ์
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  นำบัตรนักศึกษา/ประชาชนมารับอุปกรณ์ ณ ห้องปฏิบัติการ 304 เมื่อเจ้าหน้าที่อนุมัติ
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  4
                </div>
                <h4 className="font-bold text-xs text-slate-800">
                  ส่งคืนตรงเวลาพร้อมตรวจสภาพ
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  นำอุปกรณ์และอุปกรณ์เสริมครบชุดมาส่งคืน พร้อมตรวจรับสภาพร่วมกับเจ้าหน้าที่
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-2">
              <IdCard className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>ข้อควรระวัง:</strong> ผู้ยืมต้องดูแลรักษาอุปกรณ์อย่างระมัดระวัง หากอุปกรณ์ชำรุด สูญหาย หรืออุปกรณ์ส่วนควบไม่ครบถ้วน ผู้ยืมต้องรับผิดชอบตามระเบียบของภาควิชาฯ
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-100 space-y-4">
        {/* Top search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่ออุปกรณ์, รหัส เช่น ED-CAM, หรือสถานที่จัดเก็บ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Toggle available only */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              onlyAvailable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${onlyAvailable ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>เฉพาะที่พร้อมให้ยืม</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Count Label */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          พบอุปกรณ์ทั้งหมด <strong className="text-slate-800 font-bold">{filteredEquipment.length}</strong> รายการ
          {selectedCategory !== 'ทั้งหมด' && ` ในหมวดหมู่ "${selectedCategory}"`}
        </span>
        {onlyAvailable && (
          <span className="text-emerald-700 font-medium">
            (กรองเฉพาะพร้อมใช้งาน)
          </span>
        )}
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipment.map((item) => {
            const isAvailable = item.status === 'available' && item.availableQuantity > 0;
            const isOutOfStock = item.status === 'available' && item.availableQuantity === 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden flex flex-col group"
              >
                {/* Image Container */}
                <div 
                  onClick={() => onSelectDetail(item)}
                  className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  {/* Gradient bottom overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                  {/* Code badge */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs">
                    {item.code}
                  </span>

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    {item.status === 'available' ? (
                      isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/90 text-white backdrop-blur-xs shadow-xs">
                          ถูกยืมหมดแล้ว
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ว่าง ({item.availableQuantity})
                        </span>
                      )
                    ) : item.status === 'maintenance' ? (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ซ่อมบำรุง
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-600/90 text-white backdrop-blur-xs shadow-xs flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        งดให้บริการ
                      </span>
                    )}
                  </div>

                  {/* Quick preview icon */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-1.5 rounded-lg bg-black/60 text-white flex items-center gap-1 text-[11px] backdrop-blur-xs">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] font-semibold text-emerald-700 mb-1">
                      {item.category}
                    </div>
                    <h3 
                      onClick={() => onSelectDetail(item)}
                      className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-emerald-800 cursor-pointer transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
                    </p>
                  </div>

                  {/* Storage location snippet */}
                  {item.storageLocation && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.storageLocation}</span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelectDetail(item)}
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      title="ดูรายละเอียดอุปกรณ์"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          onLoginPrompt();
                        } else {
                          onRequestBorrow(item);
                        }
                      }}
                      disabled={!isAvailable}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                        isAvailable
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>
                        {isAvailable ? 'ขอยืมอุปกรณ์' : (isOutOfStock ? 'ไม่ว่างขณะนี้' : 'งดให้บริการ')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-700">ไม่พบรายการอุปกรณ์</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไขการค้นหาของคุณ ลองเปลี่ยนคำค้นหรือเลือกหมวดหมู่อื่น
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ทั้งหมด');
              setOnlyAvailable(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};
