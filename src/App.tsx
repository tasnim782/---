/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { UserCatalog } from './components/UserCatalog';
import { MyBookings } from './components/MyBookings';
import { AdminDashboard } from './components/AdminDashboard';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { BookingModal } from './components/BookingModal';
import { ProfileModal } from './components/ProfileModal';
import { SystemLogo } from './components/SystemLogo';
import { Equipment, Booking } from './types';
import { subscribeEquipment, seedInitialEquipment } from './services/equipmentService';
import { subscribeUserBookings, subscribeAllBookings } from './services/bookingService';
import { 
  Laptop, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  LogIn, 
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Eye
} from 'lucide-react';

function AppContent() {
  const { currentUser, userProfile, isAdmin, effectiveIsAdmin, viewMode, setViewMode, loginWithGoogle } = useAuth();

  const [currentTab, setCurrentTab] = useState<'catalog' | 'my-bookings' | 'admin'>('catalog');
  
  // Real-time data states
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState<boolean>(true);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Modal states
  const [selectedDetail, setSelectedDetail] = useState<Equipment | null>(null);
  const [selectedForBooking, setSelectedForBooking] = useState<Equipment | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Subscribe to Equipment catalogue (real-time for all users)
  useEffect(() => {
    setLoadingEquipment(true);
    const unsubscribe = subscribeEquipment(
      (items) => {
        setEquipmentList(items);
        setLoadingEquipment(false);
      },
      (err) => {
        console.error('Equipment subscription error:', err);
        setLoadingEquipment(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Bookings: User's bookings if normal user, or All bookings if admin
  useEffect(() => {
    if (!currentUser) {
      setUserBookings([]);
      setAllBookings([]);
      setLoadingBookings(false);
      return;
    }

    setLoadingBookings(true);

    if (isAdmin) {
      const unsubAll = subscribeAllBookings(
        (items) => {
          setAllBookings(items);
          setUserBookings(items.filter(b => b.userId === currentUser.uid));
          setLoadingBookings(false);
        },
        (err) => {
          console.error('All bookings subscription error:', err);
          setLoadingBookings(false);
        }
      );
      return () => unsubAll();
    } else {
      const unsubUser = subscribeUserBookings(
        currentUser.uid,
        (items) => {
          setUserBookings(items);
          setLoadingBookings(false);
        },
        (err) => {
          console.error('User bookings subscription error:', err);
          setLoadingBookings(false);
        }
      );
      return () => unsubUser();
    }
  }, [currentUser, isAdmin]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Badge counts
  const pendingCount = allBookings.filter(b => b.status === 'pending').length;
  const activeBorrowCount = userBookings.filter(b => b.status === 'pending' || b.status === 'approved').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        pendingCount={pendingCount}
        activeBorrowCount={activeBorrowCount}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* User View Mode Simulation Banner for Admins */}
        {isAdmin && viewMode === 'user' && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-teal-950 block text-sm">
                  กำลังแสดงผลใน: มุมมองผู้ใช้งานทั่วไป (Student/User View Mode)
                </span>
                <span className="text-teal-800 text-[11px] sm:text-xs">
                  หน้าจอจำลองการใช้งานของนักศึกษาและอาจารย์ (สามารถค้นหาอุปกรณ์ ทดลองส่งคำขอยืม และดูรายการจองได้เสมือนผู้ใช้จริง)
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setViewMode('admin');
                setCurrentTab('admin');
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-semibold shadow-xs shrink-0 flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>สลับกลับเป็นมุมมองแอดมิน</span>
            </button>
          </div>
        )}

        {/* Welcome helper banner for first-time login */}
        {currentUser && !userProfile?.phoneNumber && !userProfile?.studentOrStaffId && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                กรุณาบันทึกรหัสนักศึกษา/รหัสบุคลากร และเบอร์โทรศัพท์ติดต่อในโปรไฟล์ เพื่อความสะดวกรวดเร็วในการตรวจสอบสิทธิ์ยืมอุปกรณ์
              </span>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
            >
              กรอกข้อมูลตอนนี้
            </button>
          </div>
        )}

        {/* Tab 1: Equipment Catalog */}
        {currentTab === 'catalog' && (
          <UserCatalog
            equipmentList={equipmentList}
            onSelectDetail={(item) => setSelectedDetail(item)}
            onRequestBorrow={(item) => {
              if (!currentUser) {
                setShowLoginPrompt(true);
              } else {
                setSelectedForBooking(item);
              }
            }}
            isLoggedIn={!!currentUser}
            onLoginPrompt={() => setShowLoginPrompt(true)}
          />
        )}

        {/* Tab 2: User Bookings */}
        {currentTab === 'my-bookings' && (
          <MyBookings
            bookings={userBookings}
            loading={loadingBookings}
          />
        )}

        {/* Tab 3: Admin Dashboard */}
        {currentTab === 'admin' && effectiveIsAdmin && (
          <AdminDashboard
            equipmentList={equipmentList}
            bookingsList={allBookings}
            loadingEquipment={loadingEquipment}
            loadingBookings={loadingBookings}
          />
        )}
      </main>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              กรุณาเข้าสู่ระบบ
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              เข้าสู่ระบบด้วย Google Account ของท่านเพื่อทำรายการขอยืมอุปกรณ์ ติดตามสถานะคำขอ และบันทึกประวัติการใช้งาน
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                    setShowLoginPrompt(false);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-medium"
              >
                ไว้คราวหลัง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Detail Modal */}
      <EquipmentDetailModal
        equipment={selectedDetail}
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onRequestBorrow={(item) => {
          setSelectedDetail(null);
          if (!currentUser) {
            setShowLoginPrompt(true);
          } else {
            setSelectedForBooking(item);
          }
        }}
        isLoggedIn={!!currentUser}
      />

      {/* Booking Modal */}
      <BookingModal
        equipment={selectedForBooking}
        userProfile={userProfile}
        isOpen={!!selectedForBooking}
        onClose={() => setSelectedForBooking(null)}
        onSuccess={() => {
          triggerToast('ส่งคำขอยืมอุปกรณ์เรียบร้อยแล้ว! เจ้าหน้าที่จะตรวจสอบคำขอของคุณ');
          setCurrentTab('my-bookings');
        }}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-emerald-100 text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            {/* Branding info */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full shadow-sm overflow-hidden ring-2 ring-emerald-600/30 shrink-0">
                  <SystemLogo size="100%" variant="icon" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    ภาควิชาเทคโนโลยีการศึกษา
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    คณะศึกษาศาสตร์
                  </p>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                ระบบสารสนเทศเพื่อการบริการยืม-คืนอุปกรณ์โสตทัศนูปกรณ์ สื่อมัลติมีเดีย และเครื่องมือผลิตสื่อการเรียนรู้ เพื่อสนับสนุนการเรียนการสอนและการวิจัย
              </p>
            </div>

            {/* Service hours & rules */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                เวลาทำการและการรับ-คืนอุปกรณ์
              </h5>
              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>วันจันทร์ - วันศุกร์: 08:30 - 16:30 น.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>ปิดทำการวันเสาร์ - อาทิตย์ และวันหยุดนักขัตฤกษ์</span>
                </div>
                <p className="text-slate-500 pt-1">
                  * กรุณาแสดงบัตรประจำตัวนักศึกษาหรือบัตรประชาชนในการรับอุปกรณ์ทุกครั้ง
                </p>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-2">
              <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                จุดบริการและติดต่อสอบถาม
              </h5>
              <div className="space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ห้องปฏิบัติการเทคโนโลยีการศึกษา (304) ชั้น 3 อาคารศึกษาศาสตร์</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>โทรศัพท์: 02-XXX-XXXX ต่อ 304</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>อีเมล: edtech.equipment@edu.ac.th</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © 2026 ภาควิชาเทคโนโลยีการศึกษา (Department of Educational Technology). สงวนลิขสิทธิ์
            </div>
            <div className="flex items-center gap-4">
              <span>ฐานข้อมูล Google Firebase (Firestore Enterprise)</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Borrowing System v1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
