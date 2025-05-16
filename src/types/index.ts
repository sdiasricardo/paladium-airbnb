export type UserType = 'guest' | 'host';

export interface User {
  id: number;
  username: string;
  userType: UserType;
}

export interface Property {
  id: number;
  hostId: number;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string;
}

export interface Booking {
  id: number;
  propertyId: number;
  guestId: number;
  startDate: string;
  endDate: string;
}