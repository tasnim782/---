import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Booking, BookingStatus, ReturnCondition } from '../types';

const COLLECTION_NAME = 'bookings';
const EQUIPMENT_COLLECTION = 'equipment';

// Subscribe to all bookings (for Admin)
export function subscribeAllBookings(onData: (bookings: Booking[]) => void, onError?: (err: unknown) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Booking[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Booking);
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

// Subscribe to user bookings
export function subscribeUserBookings(userId: string, onData: (bookings: Booking[]) => void, onError?: (err: unknown) => void) {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Booking[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Booking);
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

// Submit a new booking request
export async function submitBookingRequest(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...bookingData,
      status: 'pending' as BookingStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

// User cancels their pending booking
export async function cancelBooking(bookingId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${bookingId}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, bookingId), {
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin approves borrowing and deducts stock
export async function approveBorrowing(
  bookingId: string, 
  adminNameOrEmail: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${bookingId}`;
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, COLLECTION_NAME, bookingId);
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error('ไม่พบข้อมูลการจอง');
      }

      const booking = bookingSnap.data() as Booking;
      if (booking.status !== 'pending') {
        throw new Error(`ไม่สามารถอนุมัติได้เนื่องจากสถานะคือ ${booking.status}`);
      }

      const equipmentRef = doc(db, EQUIPMENT_COLLECTION, booking.equipmentId);
      const equipmentSnap = await transaction.get(equipmentRef);
      
      let currentAvailable = 0;
      if (equipmentSnap.exists()) {
        currentAvailable = equipmentSnap.data().availableQuantity || 0;
        const newAvailable = Math.max(0, currentAvailable - booking.quantity);
        transaction.update(equipmentRef, {
          availableQuantity: newAvailable,
          updatedAt: new Date().toISOString()
        });
      }

      transaction.update(bookingRef, {
        status: 'approved',
        approvedBy: adminNameOrEmail,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin rejects borrowing
export async function rejectBorrowing(
  bookingId: string, 
  reason: string,
  adminNameOrEmail: string
): Promise<void> {
  const path = `${COLLECTION_NAME}/${bookingId}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, bookingId), {
      status: 'rejected',
      rejectionReason: reason || 'ไม่ผ่านเกณฑ์การอนุมัติ',
      approvedBy: adminNameOrEmail,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin records return with condition check and restores stock
export async function recordReturn(
  bookingId: string,
  params: {
    condition: ReturnCondition;
    notes?: string;
    adminNameOrEmail: string;
    restoreStock: boolean;
  }
): Promise<void> {
  const path = `${COLLECTION_NAME}/${bookingId}`;
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, COLLECTION_NAME, bookingId);
      const bookingSnap = await transaction.get(bookingRef);
      if (!bookingSnap.exists()) {
        throw new Error('ไม่พบข้อมูลการจอง');
      }

      const booking = bookingSnap.data() as Booking;
      if (booking.status !== 'approved') {
        throw new Error(`คำขอนี้ไม่ได้อยู่ในสถานะกำลังยืม (สถานะปัจจุบัน: ${booking.status})`);
      }

      // Restore equipment stock if usable
      if (params.restoreStock) {
        const equipmentRef = doc(db, EQUIPMENT_COLLECTION, booking.equipmentId);
        const equipmentSnap = await transaction.get(equipmentRef);
        if (equipmentSnap.exists()) {
          const currentData = equipmentSnap.data();
          const currentAvailable = currentData.availableQuantity || 0;
          const total = currentData.totalQuantity || 1;
          const restored = Math.min(total, currentAvailable + booking.quantity);
          
          transaction.update(equipmentRef, {
            availableQuantity: restored,
            updatedAt: new Date().toISOString()
          });
        }
      }

      transaction.update(bookingRef, {
        status: 'returned',
        actualReturnDate: new Date().toISOString(),
        returnedByAdmin: params.adminNameOrEmail,
        returnCondition: params.condition,
        returnNotes: params.notes || '',
        updatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Admin deletes a booking record
export async function deleteBooking(bookingId: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${bookingId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, bookingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
