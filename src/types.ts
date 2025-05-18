export type UserType = 'guest' | 'host';

export interface User {
  id: number;
  username: string;
  userType: UserType;
}

export interface PropertySearchFilters {
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  amenities?: Partial<MandatoryAmenities>;
}

export interface MandatoryAmenities {
  rooms: number;
  bathrooms: number;
  garageSpaces: number;
  hasPool: boolean;
  hasBarbecue: boolean;
  isPetFriendly: boolean;
  hasAirConditioner: boolean;
  hasHeater: boolean;
  hasGym: boolean;
}

export interface Property {
  id: number;
  hostId: number;
  title: string;
  description: string;
  price: number;
  location: string;
  visibleLocation: string;
  hideFullAddress: boolean;
  imageUrl: string;
  maxGuests: number;
  mandatoryAmenities: MandatoryAmenities;
  additionalAmenities: string[];
}

export interface Booking {
  id: number;
  propertyId: number;
  guestId: number;
  startDate: string;
  endDate: string;
  guestCount: number;
}