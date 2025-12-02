export type TravelerType = "solo" | "couple" | "family" | "group";

export interface Trip {
  id: string;
  title: string;
  destination: string;
  budget: string;
  startDate: string;
  endDate: string;
  travelerType: TravelerType;
  itinerary: string;
  costBreakdown?: string;
  favorite?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface TripPayload
  extends Omit<Trip, "id" | "createdAt" | "updatedAt"> {}
