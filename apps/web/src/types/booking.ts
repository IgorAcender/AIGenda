export interface Professional {
  id: string;
  name: string;
  avatar?: string | null;
  specialty?: string | null;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: {
    id: string;
    name: string;
  };
}

export interface TimeSlot {
  date: string;
  time: string;
  label: string;
}

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}
