import { dbPromise } from './database';
import { User, UserType } from '../types';

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