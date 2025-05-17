import { dbPromise } from './database';
import { User, UserType } from '../types';
import { getBookingsByHostId } from './bookingService';
import { getPropertiesByHostId } from './propertyService';

export const createUser = async (username: string, password: string, userType: UserType): Promise<User | null> => {
  try {
    const db = await dbPromise;
    
    // Check if username already exists
    const tx = db.transaction('users', 'readonly');
    const existingUser = await tx.store.index('username').get(username);
    
    if (existingUser) {
      return null; // Username already taken
    }
    
    // Create new user
    const id = await db.add('users', {
      username,
      password,
      userType
    });
    
    return {
      id: id as number,
      username,
      userType
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const loginUser = async (username: string, password: string): Promise<User | null> => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('users', 'readonly');
    const index = tx.store.index('username');
    
    const allUsers = await tx.store.getAll();
    const user = allUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        userType: user.userType
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const db = await dbPromise;
    const user = await db.get('users', id);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        userType: user.userType
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getRevenueByMonth = async (hostId: number): Promise<{month: string, revenue: number}[]> => {
  try {
    const bookings = await getBookingsByHostId(hostId);
    const properties = await getPropertiesByHostId(hostId);
    
    // Group bookings by month
    const revenueByMonth = new Map<string, number>();
    
    bookings.forEach(booking => {
      const property = properties.find(p => p.id === booking.propertyId);
      if (property) {
        const checkIn = new Date(booking.startDate);
        const checkOut = new Date(booking.endDate);
        const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const revenue = property.price * nights;
        
        // Format month as YYYY-MM
        const month = `${checkIn.getFullYear()}-${String(checkIn.getMonth() + 1).padStart(2, '0')}`;
        
        revenueByMonth.set(month, (revenueByMonth.get(month) || 0) + revenue);
      }
    });
    
    // Convert to array and sort by month
    const result = Array.from(revenueByMonth.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return result;
  } catch (error) {
    console.error('Error getting revenue by month:', error);
    return [];
  }
};