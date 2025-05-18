import { dbPromise } from './database';
import { Property, MandatoryAmenities } from '../types';

export const createProperty = async (
  hostId: number,
  title: string,
  description: string,
  price: number,
  location: string,
  visibleLocation: string,
  hideFullAddress: boolean,
  imageUrl: string,
  maxGuests: number,
  mandatoryAmenities: MandatoryAmenities,
  additionalAmenities: string[] = []
): Promise<Property | null> => {
  try {
    const db = await dbPromise;

    if(!validateAmenities(mandatoryAmenities)) {
      throw new Error('Missing required amenities!');
    }
    
    const id = await db.add('properties', {
      hostId,
      title,
      description,
      price,
      location,
      visibleLocation,
      hideFullAddress,
      imageUrl,
      maxGuests,
      mandatoryAmenities,
      additionalAmenities
    });
    
    return {
      id: id as number,
      hostId,
      title,
      description,
      price,
      location,
      visibleLocation,
      hideFullAddress,
      imageUrl,
      maxGuests,
      mandatoryAmenities,
      additionalAmenities
    };
  } catch (error) {
    console.error('Error creating property:', error);
    return null;
  }
};

export const getPropertiesByHostId = async (hostId: number): Promise<Property[]> => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('properties', 'readonly');
    const index = tx.store.index('hostId');
    
    const properties = await index.getAll(hostId);
    return properties as Property[];
  } catch (error) {
    console.error('Error getting host properties:', error);
    return [];
  }
};

export const getAllProperties = async (): Promise<Property[]> => {
  try {
    const db = await dbPromise;
    const properties = await db.getAll('properties');
    return properties as Property[];
  } catch (error) {
    console.error('Error getting all properties:', error);
    return [];
  }
};

export const getPropertyById = async (id: number): Promise<Property | null> => {
  try {
    const db = await dbPromise;
    const property = await db.get('properties', id);
    return property || null;
  } catch (error) {
    console.error('Error getting property:', error);
    return null;
  }
};

const validateAmenities = (amenities: MandatoryAmenities): boolean => {
  // Check that all required amenities have values
  return (
    amenities.rooms !== undefined &&
    amenities.bathrooms !== undefined &&
    amenities.garageSpaces !== undefined &&
    amenities.hasPool !== undefined &&
    amenities.hasBarbecue !== undefined &&
    amenities.isPetFriendly !== undefined &&
    amenities.hasAirConditioner !== undefined &&
    amenities.hasHeater !== undefined &&
    amenities.hasGym !== undefined
  );
};