import React, { useState, useEffect } from 'react';
import { 
  AdminRecord, 
  AdminRoleLevel, 
  AuditLog, 
  UserProfile 
} from '../types';
import { 
  getAdminList, 
  addAdminRecord, 
  removeAdmin, 
  getAllUsers, 
  toggleUserAdminRole, 
  getAuditLogs, 
  INITIAL_ADMIN_EMAIL 
} from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  History, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Mail, 
  Phone, 
  IdCard, 
  Building2, 
  RefreshCw, 
  Crown, 
  ShieldAlert, 
  KeyRound,
  FileText,
  BadgeCheck,
  UserX
} from 'lucide-react';

export const AdminManagementPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const operatorEmail = currentUser?.email || 'admin@edutech.edu';

  // Sub-tabs
  const [subTab, setSubTab] = useState<'admins' | 'users' | 'logs'>('admins');

  // Admin state
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Add admin modal/form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState<AdminRoleLevel>('admin');
  const [newPosition, setNewPosition] = useState('เจ้าหน้าที่ดูแลระบบ');
  const [newPhone, setNewPhone] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [promotingUid, setPromotingUid] = useState<string | null>(null);

  // Audit logs state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Feedback notifications
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // 1. Fetch Admins
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const data = await getAdminList();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // 2. Fetch All Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 3. Fetch Audit Logs
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchUsers();
    fetchLogs();
  }, []);

  // Handle Add Admin
  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setSavingAdmin(true);
    try {
      await addAdminRecord({
        email: newEmail.trim().toLowerCase(),
        name: newName.trim(),
        roleLevel: newRoleLevel,
        position: newPosition.trim(),
        phoneNumber: newPhone.trim(),
        addedByEmail: operatorEmail,
      });

      showStatus(`เพิ่ม ${newEmail} ในฐานะผู้ดูแลระบบเรียบร้อยแล้ว`, 'success');
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      setShowAddForm(false);
      fetchAdmins();
      fetchLogs();
    } catch (err: any) {
      showStatus(err.message || 'เกิดข้อผิดพลาดในการเพิ่มผู้ดูแลระบบ', 'error');
    } finally {
      setSavingAdmin(false);
    }
  };

  const [adminToRemove, setAdminToRemove] = useState<AdminRecord | null>(null);
  const [userToToggle, setUserToToggle] = useState<UserProfile | null>(null);
  const [removingAdmin, setRemovingAdmin] = useState(false);

  // Handle Remove Admin Confirmation
  const handleConfirmRemoveAdmin = async () => {
    if (!adminToRemove) return;
    if (adminToRemove.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) {
      showStatus('ไม่สามารถลบเจ้าของระบบเริ่มต้น (Primary Admin) ได้', 'error');
      setAdminToRemove(null);
      return;
    }

    setRemovingAdmin(true);
    try {
      await removeAdmin(adminToRemove.id, adminToRemove.email, operatorEmail);
      showStatus(`ถอดสิทธิ์ผู้ดูแลระบบของ ${adminToRemove.email} เรียบร้อยแล้ว`, 'success');
      setAdminToRemove(null);
      fetchAdmins();
      fetchLogs();
    } catch (err: any) {
      showStatus(err.message || 'เกิดข้อผิดพลาดในการถอดสิทธิ์', 'error');
    } finally {
      setRemovingAdmin(false);
    }
  };

  // Handle Promote or Demote user Confirmation
  const handleConfirmToggleUserRole = async () => {
    if (!userToToggle) return;
    const isTargetAdmin = userToToggle.role === 'admin' || userToToggle.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase();
    
    if (userToToggle.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) {
      showStatus('ไม่สามารถเปลี่ยนบทบาทของเจ้าของระบบเริ่มต้นได้', 'error');
      setUserToToggle(null);
      return;
    }

    setPromotingUid(userToToggle.uid);
    try {
      await toggleUserAdminRole(
        userToToggle, 
        isTargetAdmin ? 'user' : 'admin', 
        operatorEmail,
        isTargetAdmin ? 'ผู้ใช้ทั่วไป' : 'ผู้ดูแลระบบที่แต่งตั้ง'
      );
      showStatus(`ปรับสิทธิ์ของ ${userToToggle.displayName} เรียบร้อยแล้ว`, 'success');
      setUserToToggle(null);
      fetchUsers();
      fetchAdmins();
      fetchLogs();
    } catch (err: any) {
      showStatus(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์', 'error');
    } finally {
      setPromotingUid(null);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter === 'admin' && u.role !== 'admin' && u.email.toLowerCase() !== INITIAL_ADMIN_EMAIL.toLowerCase()) {
      return false;
    }
    if (userRoleFilter === 'user' && (u.role === 'admin' || u.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase())) {
      return false;
    }
    if (searchUser.trim()) {
      const q = searchUser.toLowerCase().trim();
      return (
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.studentOrStaffId?.toLowerCase().includes(q) ||
        u.department?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered logs
  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'all') return true;
    return l.actionType === logFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notifications Alert */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-xs animate-fadeIn ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-sm">
              <KeyRound className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                ระบบจัดการผู้ดูแลระบบ (Admin Role & User Management)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ควบคุมสิทธิ์การเข้าถึง แต่งตั้งแอดมินใหม่ และตรวจสอบประวัติการทำงานของระบบ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchAdmins();
              fetchUsers();
              fetchLogs();
            }}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'ปิดแบบฟอร์ม' : 'เพิ่มแอดมินใหม่'}</span>
          </button>
        </div>
      </div>

      {/* Add Admin Form Drawer */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 rounded-2xl p-6 border border-emerald-200/80 shadow-md animate-fadeIn space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              เพิ่มผู้ดูแลระบบใหม่ผ่าน Google Account
            </h3>
            <span className="text-[11px] text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full font-medium">
              เพิ่มล่วงหน้าได้ แม้ยังไม่เคย Login
            </span>
          </div>

          <form onSubmit={handleAddAdminSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                อีเมล Google Account (Gmail) *
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="เช่น staff.edutech@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ-นามสกุล / ชื่อเรียก
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="เช่น อ.สมชาย หรือ พี่การุณ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับสิทธิ์การดูแล (Role Level) *
              </label>
              <select
                value={newRoleLevel}
                onChange={(e) => setNewRoleLevel(e.target.value as AdminRoleLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 bg-white"
              >
                <option value="admin">Admin (ผู้ดูแลระบบเต็มรูปแบบ)</option>
                <option value="staff">Staff (เจ้าหน้าที่ตรวจรับอุปกรณ์)</option>
                <option value="super_admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ตำแหน่ง / หน้าที่รับผิดชอบ
              </label>
              <input
                type="text"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="เช่น อาจารย์ประจำภาควิชา, นักวิทยาศาสตร์"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="เช่น 081-XXX-XXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30 bg-white"
              />
            </div>

            <div className="lg:col-span-2 flex items-end justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={savingAdmin}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                <span>{savingAdmin ? 'กำลังบันทึก...' : 'บันทึกแต่งตั้งแอดมิน'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs sm:text-sm">
        <button
          onClick={() => setSubTab('admins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all ${
            subTab === 'admins'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ทีมผู้ดูแลระบบ ({admins.length + 1})</span>
        </button>

        <button
          onClick={() => setSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all ${
            subTab === 'users'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>ผู้ใช้งานทั้งหมด ({users.length})</span>
        </button>

        <button
          onClick={() => setSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-semibold border-b-2 transition-all ${
            subTab === 'logs'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4 text-emerald-600" />
          <span>บันทึกกิจกรรมแอดมิน ({logs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: ADMIN TEAM LIST */}
      {subTab === 'admins' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Primary Owner Admin Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-5 shadow-sm border border-emerald-800 space-y-4 relative overflow-hidden">
              <div className="absolute right-3 top-3 opacity-15">
                <Crown className="w-20 h-20 text-emerald-300" />
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg text-emerald-200">
                    👑
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                      Primary Super Admin
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1">
                      เจ้าของระบบหลัก
                    </h4>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-emerald-100 relative z-10 pt-1">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono text-emerald-200 truncate">{INITIAL_ADMIN_EMAIL}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ภาควิชาเทคโนโลยีการศึกษา คณะศึกษาศาสตร์</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 relative z-10">
                <span>สิทธิ์การเข้าถึง: สูงสุด (ถาวร)</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            {/* Other Registered Admins */}
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:border-emerald-200 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                        {adm.name?.charAt(0) || adm.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-800">
                            {adm.name || 'ผู้ดูแลระบบ'}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            adm.roleLevel === 'super_admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : adm.roleLevel === 'staff'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {adm.roleLevel === 'super_admin' ? 'Super Admin' : adm.roleLevel === 'staff' ? 'Staff' : 'Admin'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {adm.position || 'ผู้ดูแลระบบ'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-700 truncate">{adm.email}</span>
                    </div>
                    {adm.phoneNumber && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{adm.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>แต่งตั้งโดย: {adm.addedBy?.split('@')[0]}</span>
                  <button
                    onClick={() => setAdminToRemove(adm)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 font-medium"
                    title="ถอดสิทธิ์ผู้ดูแลระบบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ถอดสิทธิ์</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ALL REGISTERED USERS & ONE-CLICK ROLE ASSIGNMENT */}
      {subTab === 'users' && (
        <div className="space-y-4">
          {/* User search & filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="ค้นหาชื่อ, รหัสนักศึกษา, สังกัด หรืออีเมลผู้ใช้..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  userRoleFilter === 'all' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ทั้งหมด ({users.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  userRoleFilter === 'admin' ? 'bg-emerald-800 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                เฉพาะแอดมิน ({users.filter(u => u.role === 'admin' || u.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()).length})
              </button>
              <button
                onClick={() => setUserRoleFilter('user')}
                className={`px-3 py-1.5 rounded-lg font-medium ${
                  userRoleFilter === 'user' ? 'bg-slate-700 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                เฉพาะผู้ใช้ทั่วไป ({users.filter(u => u.role !== 'admin' && u.email.toLowerCase() !== INITIAL_ADMIN_EMAIL.toLowerCase()).length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ผู้ใช้งาน</th>
                    <th className="py-3 px-4">รหัสประจำตัว</th>
                    <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                    <th className="py-3 px-4">สังกัด / ภาควิชา</th>
                    <th className="py-3 px-4">บทบาทปัจจุบัน</th>
                    <th className="py-3 px-4 text-right">การจัดการสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => {
                      const isInitial = u.email?.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase();
                      const isUserAdminRole = u.role === 'admin' || isInitial;

                      return (
                        <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                  {u.displayName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-slate-900">{u.displayName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                            {u.studentOrStaffId || <span className="text-slate-300">-</span>}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {u.phoneNumber || <span className="text-slate-300">-</span>}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {u.department || 'ภาควิชาเทคโนโลยีการศึกษา'}
                          </td>

                          <td className="py-3.5 px-4">
                            {isInitial ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                👑 Super Admin (Owner)
                              </span>
                            ) : isUserAdminRole ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ShieldCheck className="w-3 h-3 inline mr-1 text-emerald-600" />
                                ผู้ดูแลระบบ (Admin)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                                ผู้ใช้งานทั่วไป
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {isInitial ? (
                              <span className="text-slate-400 text-[11px]">ถาวร</span>
                            ) : (
                              <button
                                onClick={() => setUserToToggle(u)}
                                disabled={promotingUid === u.uid}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isUserAdminRole
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                {promotingUid === u.uid
                                  ? 'กำลังบันทึก...'
                                  : isUserAdminRole
                                  ? 'ปลดเป็นผู้ใช้'
                                  : 'แต่งตั้งเป็น Admin'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        {loadingUsers ? 'กำลังโหลดรายชื่อผู้ใช้...' : 'ไม่พบข้อมูลผู้ใช้งาน'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUDIT LOGS & ACTION HISTORY */}
      {subTab === 'logs' && (
        <div className="space-y-4">
          {/* Filter row */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">ตัวกรองประเภทกิจกรรม:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium ${logFilter === 'all' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                ทั้งหมด ({logs.length})
              </button>
              <button
                onClick={() => setLogFilter('admin')}
                className={`px-3 py-1 rounded-lg font-medium ${logFilter === 'admin' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                จัดการสิทธิ์
              </button>
              <button
                onClick={() => setLogFilter('booking')}
                className={`px-3 py-1 rounded-lg font-medium ${logFilter === 'booking' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                การอนุมัติยืม
              </button>
              <button
                onClick={() => setLogFilter('equipment')}
                className={`px-3 py-1 rounded-lg font-medium ${logFilter === 'equipment' ? 'bg-emerald-700 text-white font-semibold' : 'bg-slate-100 text-slate-600'}`}
              >
                คลังอุปกรณ์
              </button>
            </div>
          </div>

          {/* Logs timeline list */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {log.targetTitle}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.details}</p>
                    <span className="text-slate-400 text-[10px]">
                      ดำเนินการโดย: {log.adminEmail}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 shrink-0 sm:text-right">
                    {new Date(log.timestamp).toLocaleString('th-TH')}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                {loadingLogs ? 'กำลังโหลดบันทึก...' : 'ยังไม่มีประวัติกิจกรรมที่บันทึก'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remove Admin Confirmation Modal */}
      {adminToRemove && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">ยืนยันการถอดสิทธิ์ผู้ดูแลระบบ</h4>
              <p className="text-xs text-slate-500">
                คุณต้องการถอดสิทธิ์ผู้ดูแลระบบของ <strong className="text-slate-800">{adminToRemove.name || adminToRemove.email}</strong> ({adminToRemove.email}) ใช่หรือไม่?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdminToRemove(null)}
                disabled={removingAdmin}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveAdmin}
                disabled={removingAdmin}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                {removingAdmin ? 'กำลังถอดสิทธิ์...' : 'ยืนยันถอดสิทธิ์'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle User Admin Role Confirmation Modal */}
      {userToToggle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
              userToToggle.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {userToToggle.role === 'admin' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                {userToToggle.role === 'admin' ? 'ยืนยันการปรับลดสิทธิ์' : 'ยืนยันการแต่งตั้งผู้ดูแลระบบ'}
              </h4>
              <p className="text-xs text-slate-500">
                คุณต้องการ{userToToggle.role === 'admin' ? 'ปรับลดสิทธิ์เป็นผู้ใช้งานทั่วไป' : 'แต่งตั้งเป็นผู้ดูแลระบบ (Admin)'} สำหรับ <strong className="text-slate-800">{userToToggle.displayName}</strong> ({userToToggle.email}) ใช่หรือไม่?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToToggle(null)}
                disabled={promotingUid === userToToggle.uid}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleUserRole}
                disabled={promotingUid === userToToggle.uid}
                className={`flex-1 py-2 text-white rounded-xl text-xs font-semibold shadow-xs ${
                  userToToggle.role === 'admin' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {promotingUid === userToToggle.uid ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
