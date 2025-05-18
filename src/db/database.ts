// Using IndexedDB for browser storage instead of SQLite
import { openDB, deleteDB } from 'idb';

const initDB = async () => {
  // Increment the version number to trigger the upgrade function
  const db = await openDB('airbnb-clone', 4, {
    upgrade(db, oldVersion, newVersion, transaction) {
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
      
      // Create property images store
      if (!db.objectStoreNames.contains('propertyImages')) {
        const imageStore = db.createObjectStore('propertyImages', { keyPath: 'id', autoIncrement: true });
        imageStore.createIndex('propertyId', 'propertyId', { unique: false });
      }
      
      // Migrate existing properties to use the new images array
      if (oldVersion < 4 && db.objectStoreNames.contains('properties')) {
        const propertyStore = transaction.objectStore('properties');
        const imageStore = transaction.objectStore('propertyImages');
        
        propertyStore.openCursor().then(function iterateCursor(cursor) {
          if (!cursor) return;
          
          const property = cursor.value;
          if (property.imageUrl) {
            // Create a new image entry
            imageStore.add({
              propertyId: property.id,
              imageData: property.imageUrl,
              isPrimary: true
            });
            
            // Update property to use images array
            property.images = [];
            delete property.imageUrl;
            cursor.update(property);
          }
          
          return cursor.continue().then(iterateCursor);
        });
      }
    }
  });

  return db;
};

export const clearDatabase = async (): Promise<boolean> => {
  try {
    await deleteDB('airbnb-clone');
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    return false;
  }
};

export const dbPromise = initDB();

export default dbPromise;