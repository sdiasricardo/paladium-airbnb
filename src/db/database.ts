// Using IndexedDB for browser storage instead of SQLite
import { openDB } from 'idb';

const initDB = async () => {
  const db = await openDB('airbnb-clone', 1, {
    upgrade(db) {
      // Create users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('username', 'username', { unique: true });
      }

      // Create properties store
      if (!db.objectStoreNames.contains('properties')) {
        const propertyStore = db.createObjectStore('properties', { keyPath: 'id', autoIncrement: true });
        propertyStore.createIndex('hostId', 'hostId', { unique: false });
      }

      // Create bookings store
      if (!db.objectStoreNames.contains('bookings')) {
        const bookingStore = db.createObjectStore('bookings', { keyPath: 'id', autoIncrement: true });
        bookingStore.createIndex('propertyId', 'propertyId', { unique: false });
        bookingStore.createIndex('guestId', 'guestId', { unique: false });
      }
    }
  });

  return db;
};

export const dbPromise = initDB();

export default dbPromise;