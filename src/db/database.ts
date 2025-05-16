import Database from 'better-sqlite3';

// Initialize the database
const db = new Database('airbnb.db');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    userType TEXT NOT NULL CHECK (userType IN ('guest', 'host'))
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hostId INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    location TEXT NOT NULL,
    imageUrl TEXT,
    FOREIGN KEY (hostId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propertyId INTEGER NOT NULL,
    guestId INTEGER NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    FOREIGN KEY (propertyId) REFERENCES properties(id),
    FOREIGN KEY (guestId) REFERENCES users(id)
  );
`);

export default db;