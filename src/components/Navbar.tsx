import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SystemLogo } from './SystemLogo';
import { 
  Laptop, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  ShieldCheck, 
  Clock, 
  Package, 
  BarChart3,
  Menu,
  X,
  Eye
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'catalog' | 'my-bookings' | 'admin';
  setCurrentTab: (tab: 'catalog' | 'my-bookings' | 'admin') => void;
  onOpenProfile: () => void;
  pendingCount?: number;
  activeBorrowCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenProfile,
  pendingCount = 0,
  activeBorrowCount = 0,
}) => {
  const { currentUser, userProfile, isAdmin, effectiveIsAdmin, viewMode, setViewMode, loginWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Department Branding */}
          <div 
            onClick={() => { setCurrentTab('catalog'); setMobileMenuOpen(false); }}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 rounded-full shadow-md shadow-emerald-800/25 group-hover:scale-105 transition-transform overflow-hidden ring-2 ring-emerald-600/30 shrink-0">
              <SystemLogo size="100%" variant="icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-emerald-950 tracking-tight">
                  ระบบยืม-คืนอุปกรณ์สื่อโสตทัศนูปกรณ์
                </span>
                <span className="hidden sm:inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  EdTech
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                ภาควิชาเทคโนโลยีการศึกษา
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'catalog'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>แคตตาล็อกอุปกรณ์</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setCurrentTab('my-bookings')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'my-bookings'
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>การจองของฉัน</span>
                {activeBorrowCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-emerald-600 text-white">
                    {activeBorrowCount}
                  </span>
                )}
              </button>
            )}

            {effectiveIsAdmin && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentTab === 'admin'
                    ? 'bg-emerald-800 text-white font-semibold shadow-sm shadow-emerald-900/20'
                    : 'text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/80'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>แดชบอร์ดผู้ดูแล</span>
                {pendingCount > 0 && (
                  <span className={`px-1.5 py-0.2 text-[11px] font-bold rounded-full ${
                    currentTab === 'admin' ? 'bg-amber-400 text-amber-950' : 'bg-amber-500 text-white'
                  }`}>
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* User Profile, View Switcher & Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin View Mode Switcher */}
            {isAdmin && (
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => {
                    setViewMode('user');
                    if (currentTab === 'admin') setCurrentTab('catalog');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'user'
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="สลับเป็นมุมมองผู้ใช้ทั่วไป (จำลองมุมมองนักศึกษา)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>มุมมองผู้ใช้</span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('admin');
                    setCurrentTab('admin');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                    viewMode === 'admin'
                      ? 'bg-emerald-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="สลับเป็นมุมมองผู้ดูแลระบบ (Admin Mode)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>แอดมิน</span>
                </button>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
                  title="คลิกเพื่อแก้ไขโปรไฟล์"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block leading-tight">
                    <div className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                      {userProfile?.displayName || currentUser.displayName || 'ผู้ใช้งาน'}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {isAdmin ? (
                        <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                          viewMode === 'user' 
                            ? 'text-teal-700 bg-teal-50 border-teal-200' 
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        }`}>
                          {viewMode === 'user' ? (
                            <>
                              <Eye className="w-2.5 h-2.5 mr-0.5 text-teal-600" />
                              โหมดผู้ใช้
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                              Admin
                            </>
                          )}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          {userProfile?.studentOrStaffId || 'ผู้ใช้ทั่วไป'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-medium shadow-sm shadow-emerald-800/20 hover:shadow transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <button
                onClick={onOpenProfile}
                className="p-1 rounded-full ring-2 ring-emerald-500/30"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0) : 'U'}
                  </div>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg animate-fadeIn">
          {currentUser && (
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm text-slate-800">
                    {userProfile?.displayName || currentUser.displayName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }}
                className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
              >
                แก้ไขโปรไฟล์
              </button>
            </div>
          )}

          {/* Mobile view switcher for admin */}
          {isAdmin && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">สลับโหมดมุมมอง:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setViewMode('user');
                    if (currentTab === 'admin') setCurrentTab('catalog');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    viewMode === 'user' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600 bg-white border border-slate-200'
                  }`}
                >
                  มุมมองผู้ใช้
                </button>
                <button
                  onClick={() => {
                    setViewMode('admin');
                    setCurrentTab('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    viewMode === 'admin' ? 'bg-emerald-900 text-white font-bold' : 'text-slate-600 bg-white border border-slate-200'
                  }`}
                >
                  แอดมิน
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => { setCurrentTab('catalog'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentTab === 'catalog'
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-5 h-5 text-emerald-600" />
            <span>แคตตาล็อกอุปกรณ์</span>
          </button>

          {currentUser && (
            <button
              onClick={() => { setCurrentTab('my-bookings'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'my-bookings'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>การจองของฉัน</span>
              </div>
              {activeBorrowCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white">
                  {activeBorrowCount}
                </span>
              )}
            </button>
          )}

          {effectiveIsAdmin && (
            <button
              onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === 'admin'
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-emerald-100/70 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <span>แดชบอร์ดผู้ดูแลระบบ</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-amber-950">
                  {pendingCount} รออนุมัติ
                </span>
              )}
            </button>
          )}

          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={() => { loginWithGoogle(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-medium"
              >
                <LogIn className="w-5 h-5" />
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
