import db from './database';
import { Property } from '../types';

export const createProperty = (
  hostId: number,
  title: string,
  description: string,
  price: number,
  location: string,
  imageUrl: string
): Property | null => {
  try {
    const stmt = db.prepare(
      'INSERT INTO properties (hostId, title, description, price, location, imageUrl) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(hostId, title, description, price, location, imageUrl);
    
    if (result.lastInsertRowid) {
      return {
        id: result.lastInsertRowid as number,
        hostId,
        title,
        description,
        price,
        location,
        imageUrl
      };
    }
    return null;
  } catch (error) {
    console.error('Error creating property:', error);
    return null;
  }
};

export const getPropertiesByHostId = (hostId: number): Property[] => {
  try {
    const stmt = db.prepare('SELECT * FROM properties WHERE hostId = ?');
    return stmt.all(hostId) as Property[];
  } catch (error) {
    console.error('Error getting host properties:', error);
    return [];
  }
};

export const getAllProperties = (): Property[] => {
  try {
    const stmt = db.prepare('SELECT * FROM properties');
    return stmt.all() as Property[];
  } catch (error) {
    console.error('Error getting all properties:', error);
    return [];
  }
};

export const getPropertyById = (id: number): Property | null => {
  try {
    const stmt = db.prepare('SELECT * FROM properties WHERE id = ?');
    const property = stmt.get(id) as Property | undefined;
    return property || null;
  } catch (error) {
    console.error('Error getting property:', error);
    return null;
  }
};