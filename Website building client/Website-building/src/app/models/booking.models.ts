export interface BookingDto {
  siteId: number;
  name: string;
  phone: string;
  date?: string;
  time?: string;
  note?: string;
  email?: string;
}

export interface Booking {
  id: number;
  siteId: number;
  name: string;
  phone: string;
  date?: string;
  time?: string;
  note?: string;
  status: string;
  createdAt: string;
  email?: string;
}
