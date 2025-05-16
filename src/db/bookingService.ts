import { dbPromise } from './database';
import { Booking } from '../types';
import { isWithinInterval, parseISO } from 'date-fns';

export const createBooking = async (
  propertyId: number,
  guestId: number,
  startDate: string,
  endDate: string
): Promise<Booking | null> => {
  try {
    // Check if the property is available for the selected dates
    const isAvailable = await isPropertyAvailable(propertyId, startDate, endDate);
    if (!isAvailable) {
      return null;
    }

    const db = await dbPromise;
    const id = await db.add('bookings', {
      propertyId,
      guestId,
      startDate,
      endDate
    });
    
    return {
      id: id as number,
      propertyId,
      guestId,
      startDate,
      endDate
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return null;
  }
};

export const getBookingsByGuestId = async (guestId: number): Promise<Booking[]> => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('bookings', 'readonly');
    const index = tx.store.index('guestId');
    
    const bookings = await index.getAll(guestId);
    return bookings as Booking[];
  } catch (error) {
    console.error('Error getting guest bookings:', error);
    return [];
  }
};

export const getBookingsByPropertyId = async (propertyId: number): Promise<Booking[]> => {
  try {
    const db = await dbPromise;
    const tx = db.transaction('bookings', 'readonly');
    const index = tx.store.index('propertyId');
    
    const bookings = await index.getAll(propertyId);
    return bookings as Booking[];
  } catch (error) {
    console.error('Error getting property bookings:', error);
    return [];
  }
};

export const isPropertyAvailable = async (propertyId: number, startDate: string, endDate: string): Promise<boolean> => {
  try {
    const bookings = await getBookingsByPropertyId(propertyId);
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