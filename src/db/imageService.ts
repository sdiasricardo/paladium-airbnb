import { dbPromise } from './database';
import { PropertyImage } from '../types';

export const addPropertyImage = async (
  propertyId: number,
  imageData: string,
  isPrimary: boolean = false
): Promise<PropertyImage | null> => {
  try {
    const db = await dbPromise;
    
    // If this is set as primary, update any existing primary images
    if (isPrimary) {
      await updatePrimaryImageStatus(propertyId, false);
    }
    
    const image: PropertyImage = {
      propertyId,
      imageData,
      isPrimary
    };
    
    const id = await db.add('propertyImages', image);
    
    return {
      ...image,
      id: id as number
    };
  } catch (error) {
    console.error('Error adding property image:', error);
    return null;
  }
};

export const getPropertyImages = async (propertyId: number): Promise<PropertyImage[]> => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('propertyImages', 'readonly');
    const index = tx.store.index('propertyId');
    
    const images = await index.getAll(propertyId);
    return images as PropertyImage[];
  } catch (error) {
    console.error('Error getting property images:', error);
    return [];
  }
};

export const deletePropertyImage = async (imageId: number): Promise<boolean> => {
  try {
    const db = await dbPromise;
    await db.delete('propertyImages', imageId);
    return true;
  } catch (error) {
    console.error('Error deleting property image:', error);
    return false;
  }
};

export const setPrimaryImage = async (imageId: number, propertyId: number): Promise<boolean> => {
  try {
    const db = await dbPromise;
    
    // First, set all images for this property to non-primary
    await updatePrimaryImageStatus(propertyId, false);
    
    // Then set the selected image as primary
    const image = await db.get('propertyImages', imageId);
    if (image) {
      image.isPrimary = true;
      await db.put('propertyImages', image);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error setting primary image:', error);
    return false;
  }
};

// Helper function to update primary status of all images for a property
const updatePrimaryImageStatus = async (propertyId: number, isPrimary: boolean): Promise<void> => {
  const db = await dbPromise;
  const tx = db.transaction('propertyImages', 'readwrite');
  const index = tx.store.index('propertyId');
  
  let cursor = await index.openCursor(propertyId);
  
  while (cursor) {
    const image = cursor.value;
    image.isPrimary = isPrimary;
    await cursor.update(image);
    cursor = await cursor.continue();
  }
};