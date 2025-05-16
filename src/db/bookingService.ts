import db from './database';
import { Booking } from '../types';
import { isWithinInterval, parseISO } from 'date-fns';

export const createBooking = (
  propertyId: number,
  guestId: number,
  startDate: string,
  endDate: string
): Booking | null => {
  try {
    // Check if the property is available for the selected dates
    if (!isPropertyAvailable(propertyId, startDate, endDate)) {
      return null;
    }

    const stmt = db.prepare(
      'INSERT INTO bookings (propertyId, guestId, startDate, endDate) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(propertyId, guestId, startDate, endDate);
    
    if (result.lastInsertRowid) {
      return {
        id: result.lastInsertRowid as number,
        propertyId,
        guestId,
        startDate,
        endDate
      };
    }
    return null;
  } catch (error) {
    console.error('Error creating booking:', error);
    return null;
  }
};

export const getBookingsByGuestId = (guestId: number): Booking[] => {
  try {
    const stmt = db.prepare('SELECT * FROM bookings WHERE guestId = ?');
    return stmt.all(guestId) as Booking[];
  } catch (error) {
    console.error('Error getting guest bookings:', error);
    return [];
  }
};

export const getBookingsByPropertyId = (propertyId: number): Booking[] => {
  try {
    const stmt = db.prepare('SELECT * FROM bookings WHERE propertyId = ?');
    return stmt.all(propertyId) as Booking[];
  } catch (error) {
    console.error('Error getting property bookings:', error);
    return [];
  }
};

export const isPropertyAvailable = (propertyId: number, startDate: string, endDate: string): boolean => {
  try {
    const bookings = getBookingsByPropertyId(propertyId);
    const requestedStart = parseISO(startDate);
    const requestedEnd = parseISO(endDate);

    // Check if any existing booking overlaps with the requested dates
    const isOverlapping = bookings.some(booking => {
      const bookingStart = parseISO(booking.startDate);
      const bookingEnd = parseISO(booking.endDate);

      return (
        isWithinInterval(requestedStart, { start: bookingStart, end: bookingEnd }) ||
        isWithinInterval(requestedEnd, { start: bookingStart, end: bookingEnd }) ||
        isWithinInterval(bookingStart, { start: requestedStart, end: requestedEnd })
      );
    });

    return !isOverlapping;
  } catch (error) {
    console.error('Error checking property availability:', error);
    return false;
  }
};