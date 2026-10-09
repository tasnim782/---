import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Equipment } from '../types';
import { INITIAL_EQUIPMENT_DATA } from '../data/seedData';

const COLLECTION_NAME = 'equipment';

export function subscribeEquipment(onData: (items: Equipment[]) => void, onError?: (err: unknown) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy('code', 'asc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Equipment[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          code: data.code || 'ED-000',
          name: data.name || 'อุปกรณ์',
          category: data.category || 'อุปกรณ์เสริมและอื่นๆ',
          totalQuantity: typeof data.totalQuantity === 'number' ? data.totalQuantity : 1,
          availableQuantity: typeof data.availableQuantity === 'number' ? data.availableQuantity : 0,
          status: data.status || 'available',
          imageUrl: data.imageUrl || '',
          description: data.description || '',
          storageLocation: data.storageLocation || 'ภาควิชาเทคโนโลยีการศึกษา',
          accessories: data.accessories || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });
      onData(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    }
  );
}

export async function addEquipment(item: Omit<Equipment, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...item,
      totalQuantity: Number(item.totalQuantity),
      availableQuantity: Number(item.availableQuantity),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const cleanUpdates = { ...updates };
    if (typeof cleanUpdates.totalQuantity !== 'undefined') {
      cleanUpdates.totalQuantity = Number(cleanUpdates.totalQuantity);
    }
    if (typeof cleanUpdates.availableQuantity !== 'undefined') {
      cleanUpdates.availableQuantity = Number(cleanUpdates.availableQuantity);
    }
    cleanUpdates.updatedAt = new Date().toISOString();
    
    await updateDoc(doc(db, COLLECTION_NAME, id), cleanUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteEquipment(id: string): Promise<void> {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedInitialEquipment(): Promise<number> {
  try {
    // Check if already seeded
    const existing = await getDocs(collection(db, COLLECTION_NAME));
    if (!existing.empty) {
      return 0;
    }

    const batch = writeBatch(db);
    for (const item of INITIAL_EQUIPMENT_DATA) {
      const docRef = doc(collection(db, COLLECTION_NAME));
      batch.set(docRef, item);
    }
    await batch.commit();
    return INITIAL_EQUIPMENT_DATA.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    return 0;
  }
}
