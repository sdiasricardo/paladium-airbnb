import { dbPromise } from './database';
import { Property, MandatoryAmenities, PropertySearchFilters } from '../types';

export const searchProperties = async (
  searchTerm: string = '',
  filters?: PropertySearchFilters
): Promise<Property[]> => {
  try {
    const allProperties = await getAllProperties();
    
    return allProperties.filter(property => {
      // Search by term (description and location)
      const matchesSearchTerm = searchTerm === '' || 
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearchTerm || !filters) return matchesSearchTerm;
      
      // Apply filters if they exist
      const amenitiesMatch = !filters.amenities || Object.entries(filters.amenities).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        
        // For numeric values like rooms and bathrooms, we want properties with at least that many
        if (key === 'rooms' || key === 'bathrooms') {
          return property.mandatoryAmenities[key] >= (value as number);
        }
        
        return property.mandatoryAmenities[key as keyof MandatoryAmenities] === value;
      });
      
      const priceMatch = (!filters.minPrice || property.price >= filters.minPrice) && 
                         (!filters.maxPrice || property.price <= filters.maxPrice);
      
      const guestsMatch = !filters.guests || property.maxGuests >= filters.guests;
      
      return amenitiesMatch && priceMatch && guestsMatch;
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    return [];
  }
};

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