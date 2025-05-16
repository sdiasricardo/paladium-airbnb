import db from './database';
import { User, UserType } from '../types';

export const createUser = (username: string, password: string, userType: UserType): User | null => {
  try {
    const stmt = db.prepare('INSERT INTO users (username, password, userType) VALUES (?, ?, ?)');
    const result = stmt.run(username, password, userType);
    
    if (result.lastInsertRowid) {
      return {
        id: result.lastInsertRowid as number,
        username,
        userType
      };
    }
    return null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const loginUser = (username: string, password: string): User | null => {
  try {
    const stmt = db.prepare('SELECT id, username, userType FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, password) as User | undefined;
    return user || null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
};

export const getUserById = (id: number): User | null => {
  try {
    const stmt = db.prepare('SELECT id, username, userType FROM users WHERE id = ?');
    const user = stmt.get(id) as User | undefined;
    return user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};