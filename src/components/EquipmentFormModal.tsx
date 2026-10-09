import React, { useState, useEffect } from 'react';
import { Equipment, EquipmentCategory, EquipmentStatus } from '../types';
import { addEquipment, updateEquipment } from '../services/equipmentService';
import { 
  X, 
  Package, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentToEdit?: Equipment | null;
}

const CATEGORIES: EquipmentCategory[] = [
  'กล้องและวิดีโอ',
  'ไมโครโฟนและระบบเสียง',
  'ขาตั้งกล้องและกิมบอล',
  'โปรเจกเตอร์และจอภาพ',
  'คอมพิวเตอร์และแท็บเล็ต',
  'ไฟและอุปกรณ์สตูดิโอ',
  'อุปกรณ์เสริมและอื่นๆ',
];

const PRESET_IMAGES = [
  { label: 'กล้อง Sony Mirrorless', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80' },
  { label: 'กล้อง Lumix Video', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80' },
  { label: 'ไมค์ไร้สาย Rode Wireless', url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80' },
  { label: 'ไมค์พอดแคสต์ Shure', url: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?auto=format&fit=crop&w=800&q=80' },
  { label: 'ขาตั้งกล้อง Video Tripod', url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80' },
  { label: 'กิมบอล DJI RS Gimbal', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80' },
  { label: 'เครื่องฉายโปรเจกเตอร์', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80' },
  { label: 'ไฟสตูดิโอ Godox LED', url: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80' },
  { label: 'iPad Pro / แท็บเล็ต', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80' },
  { label: 'เมาส์ปากกา Wacom Tablet', url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80' },
];

export const EquipmentFormModal: React.FC<EquipmentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  equipmentToEdit,
}) => {
  const isEditing = !!equipmentToEdit;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('กล้องและวิดีโอ');
  const [totalQuantity, setTotalQuantity] = useState<number>(1);
  const [availableQuantity, setAvailableQuantity] = useState<number>(1);
  const [status, setStatus] = useState<EquipmentStatus>('available');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [accessories, setAccessories] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setCode(equipmentToEdit.code || '');
      setName(equipmentToEdit.name || '');
      setCategory(equipmentToEdit.category || 'กล้องและวิดีโอ');
      setTotalQuantity(equipmentToEdit.totalQuantity ?? 1);
      setAvailableQuantity(equipmentToEdit.availableQuantity ?? 1);
      setStatus(equipmentToEdit.status || 'available');
      setImageUrl(equipmentToEdit.imageUrl || '');
      setDescription(equipmentToEdit.description || '');
      setStorageLocation(equipmentToEdit.storageLocation || '');
      setAccessories(equipmentToEdit.accessories || '');
    } else {
      setCode('');
      setName('');
      setCategory('กล้องและวิดีโอ');
      setTotalQuantity(1);
      setAvailableQuantity(1);
      setStatus('available');
      setImageUrl('');
      setDescription('');
      setStorageLocation('ห้องปฏิบัติการเทคโนโลยีการศึกษา 304');
      setAccessories('');
    }
    setErrorMsg('');
  }, [equipmentToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 2MB กรุณาเลือกรูปขนาดเล็กลง');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress with canvas
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim()) {
      setErrorMsg('กรุณาระบุรหัสอุปกรณ์ (เช่น ED-CAM-001)');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('กรุณาระบุชื่ออุปกรณ์');
      return;
    }

    const total = Number(totalQuantity);
    const available = Number(availableQuantity);
    if (available > total) {
      setErrorMsg('จำนวนคงเหลือต้องไม่เกินจำนวนทั้งหมด');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        totalQuantity: total,
        availableQuantity: available,
        status,
        imageUrl: imageUrl.trim(),
        description: description.trim(),
        storageLocation: storageLocation.trim(),
        accessories: accessories.trim(),
      };

      if (isEditing && equipmentToEdit) {
        await updateEquipment(equipmentToEdit.id, payload);
      } else {
        await addEquipment({
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Equipment save error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลอุปกรณ์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn my-6">
        {/* Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าสู่ระบบ'}
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                ภาควิชาเทคโนโลยีการศึกษา
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Code & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รหัสอุปกรณ์ (Equipment Code) *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น ED-CAM-001, ED-MIC-003"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm uppercase focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หมวดหมู่อุปกรณ์ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่ออุปกรณ์ *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Sony Alpha A7 IV พร้อมเลนส์ 24-70mm"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Quantities & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนทั้งหมด (Total) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalQuantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTotalQuantity(val);
                  if (!isEditing || availableQuantity > val) {
                    setAvailableQuantity(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                คงเหลือพร้อมใช้งาน *
              </label>
              <input
                type="number"
                min={0}
                max={totalQuantity}
                required
                value={availableQuantity}
                onChange={(e) => setAvailableQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-semibold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะอุปกรณ์ *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EquipmentStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
              >
                <option value="available">พร้อมใช้งาน (Available)</option>
                <option value="maintenance">กำลังซ่อมบำรุง (Maintenance)</option>
                <option value="unavailable">งดให้บริการ (Unavailable)</option>
              </select>
            </div>
          </div>

          {/* Image Upload / URL / Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              รูปภาพอุปกรณ์
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {/* Preview image */}
              <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-slate-300" />
                )}
              </div>

              {/* Input & Upload */}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="ใส่ URL รูปภาพ หรือเลือกรูปภาพตัวอย่างด้านล่าง"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
                />

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>อัปโหลดรูปภาพจากเครื่อง</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                หรือเลือกรูปภาพตัวอย่างมาตรฐานของภาควิชาฯ:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className="text-[10px] px-2 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Storage Location & Accessories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานที่จัดเก็บ / ตู้เก็บ
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="เช่น ตู้เก็บกล้อง A1 ห้องแล็บ 304"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อุปกรณ์ควบที่มาในชุด (Accessories)
              </label>
              <input
                type="text"
                value={accessories}
                onChange={(e) => setAccessories(e.target.value)}
                placeholder="เช่น แบตเตอรี่ 2 ก้อน, สายชาร์จ, กระเป๋า"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายละเอียด สเปก และข้อควรระวัง
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียดทางเทคนิค ข้อกำหนด หรือข้อแนะนำในการใช้งาน"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'กำลังบันทึก...' : (isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มอุปกรณ์')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
