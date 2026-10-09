import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { AdminRecord, AdminRoleLevel, AuditLog, UserProfile, UserRole } from '../types';

export const INITIAL_ADMIN_EMAIL = 'tasnimhakeng@gmail.com';

export async function isUserAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (email && email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  if (!uid) return false;

  try {
    const adminDoc = await getDoc(doc(db, 'admins', uid));
    if (adminDoc.exists()) {
      return true;
    }
  } catch (err) {
    console.warn('Error checking admin document for uid:', err);
  }

  // Also check if an admin record exists with this email
  if (email) {
    try {
      const emailDoc = await getDoc(doc(db, 'admins', email.toLowerCase().replace(/[@.]/g, '_')));
      if (emailDoc.exists()) {
        return true;
      }
    } catch (err) {
      console.warn('Error checking admin document for email:', err);
    }
  }

  return false;
}

export async function getAdminList(): Promise<AdminRecord[]> {
  const path = 'admins';
  try {
    const snap = await getDocs(collection(db, path));
    const list: AdminRecord[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        email: data.email || docSnap.id,
        name: data.name || '',
        roleLevel: data.roleLevel || 'admin',
        position: data.position || 'ผู้ดูแลระบบ',
        phoneNumber: data.phoneNumber || '',
        addedBy: data.addedBy || 'ระบบ',
        addedAt: data.addedAt || new Date().toISOString()
      });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addAdminRecord(params: {
  email: string;
  name: string;
  roleLevel: AdminRoleLevel;
  position: string;
  phoneNumber?: string;
  addedByEmail: string;
}): Promise<void> {
  const cleanEmail = params.email.trim().toLowerCase();
  const docId = cleanEmail.replace(/[@.]/g, '_');
  const path = `admins/${docId}`;
  
  try {
    await setDoc(doc(db, 'admins', docId), {
      email: cleanEmail,
      name: params.name.trim(),
      roleLevel: params.roleLevel,
      position: params.position.trim(),
      phoneNumber: params.phoneNumber?.trim() || '',
      addedBy: params.addedByEmail,
      addedAt: new Date().toISOString()
    });

    // Record audit log
    await logAdminActivity({
      adminEmail: params.addedByEmail,
      adminName: params.addedByEmail,
      action: 'เพิ่มผู้ดูแลระบบใหม่',
      actionType: 'admin',
      targetTitle: cleanEmail,
      details: `แต่งตั้ง ${params.name || cleanEmail} ในตำแหน่ง ${params.position} (${params.roleLevel})`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function addAdminEmail(email: string, name: string, addedByEmail: string): Promise<void> {
  return addAdminRecord({
    email,
    name,
    roleLevel: 'admin',
    position: 'ผู้ดูแลระบบ',
    addedByEmail,
  });
}

export async function removeAdmin(adminId: string, adminEmail: string, removedByEmail: string): Promise<void> {
  const path = `admins/${adminId}`;
  try {
    await deleteDoc(doc(db, 'admins', adminId));

    // Record audit log
    await logAdminActivity({
      adminEmail: removedByEmail,
      adminName: removedByEmail,
      action: 'ถอดสิทธิ์ผู้ดูแลระบบ',
      actionType: 'admin',
      targetTitle: adminEmail,
      details: `ยกเลิกสิทธิ์แอดมินของ ${adminEmail}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Get all registered users from `/users`
export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        uid: docSnap.id,
        email: data.email || '',
        displayName: data.displayName || 'ผู้ใช้งาน',
        photoURL: data.photoURL || '',
        phoneNumber: data.phoneNumber || '',
        studentOrStaffId: data.studentOrStaffId || '',
        department: data.department || '',
        role: data.role || 'user',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Promote user to admin or demote to user
export async function toggleUserAdminRole(
  user: UserProfile, 
  newRole: UserRole, 
  adminOperatorEmail: string,
  position: string = 'ผู้ดูแลระบบ'
): Promise<void> {
  const userPath = `users/${user.uid}`;
  try {
    // 1. Update user document
    await updateDoc(doc(db, 'users', user.uid), {
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    // 2. Sync `/admins` collection
    const adminDocId = user.email.toLowerCase().replace(/[@.]/g, '_');
    if (newRole === 'admin') {
      await setDoc(doc(db, 'admins', adminDocId), {
        email: user.email.toLowerCase(),
        name: user.displayName,
        roleLevel: 'admin',
        position: position,
        phoneNumber: user.phoneNumber || '',
        addedBy: adminOperatorEmail,
        addedAt: new Date().toISOString()
      });

      // Also set doc with uid
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email.toLowerCase(),
        name: user.displayName,
        roleLevel: 'admin',
        position: position,
        phoneNumber: user.phoneNumber || '',
        addedBy: adminOperatorEmail,
        addedAt: new Date().toISOString()
      });

      await logAdminActivity({
        adminEmail: adminOperatorEmail,
        adminName: adminOperatorEmail,
        action: 'แต่งตั้งผู้ใช้เป็นแอดมิน',
        actionType: 'admin',
        targetTitle: user.email,
        details: `เลื่อนขั้น ${user.displayName} (${user.studentOrStaffId || user.email}) เป็นผู้ดูแลระบบ`,
      });
    } else {
      // Remove admin records
      try {
        await deleteDoc(doc(db, 'admins', adminDocId));
      } catch (e) { /* ignore */ }
      try {
        await deleteDoc(doc(db, 'admins', user.uid));
      } catch (e) { /* ignore */ }

      await logAdminActivity({
        adminEmail: adminOperatorEmail,
        adminName: adminOperatorEmail,
        action: 'ปรับลดสิทธิ์เป็นผู้ใช้ทั่วไป',
        actionType: 'admin',
        targetTitle: user.email,
        details: `ปรับสิทธิ์ ${user.displayName} กลับเป็นผู้ใช้ทั่วไป`,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath);
  }
}

// Log admin action to `/audit_logs`
export async function logAdminActivity(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not write audit log:', err);
  }
}

// Fetch recent audit logs
export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'audit_logs';
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    const logs: AuditLog[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      logs.push({
        id: docSnap.id,
        adminEmail: d.adminEmail || '',
        adminName: d.adminName || '',
        action: d.action || '',
        actionType: d.actionType || 'admin',
        targetTitle: d.targetTitle || '',
        details: d.details || '',
        timestamp: d.timestamp || new Date().toISOString()
      });
    });
    return logs;
  } catch (error) {
    console.warn('Could not fetch audit logs:', error);
    return [];
  }
}
