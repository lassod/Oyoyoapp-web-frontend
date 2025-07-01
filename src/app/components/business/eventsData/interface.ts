export interface EventDetails {
  CategoryId: number;
  UserId: number;
  title: string;
  description: string;
  capacity: number;
  media: Record<string, any>[]; // Array of objects (can replace `any` with a more specific type if needed)
  vendors: number[];
  organizer: string;
  type: number;
  ticket: string;
  date: string; // ISO 8601 date string
  endTime: string; // ISO 8601 date string
  physical: string;
  location: string;
  state: string;
  address: string;
  plans: {
    name: string;
    price: number;
    description: string;
    items: Record<string, any>[]; // Array of objects
  };
}

interface Media {
  url: string;
}

interface Vendor {
  id: number;
  email: string;
  experience: string;
  avatar: string | null;
  status: string;
  evidence_of_experience: string;
  createdAt: string;
  updatedAt: string;
  CategoryId: number;
  UserId: number;
  Rating: number;
  keywords: string[];
  bio: string;
  country: string;
  state: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  User: {
    id: number;
    username: string;
    bio: string | null;
    timezone: string | null;
    avatar: string | null;
    phone: string | null;
    email: string;
    first_name: string;
    last_name: string;
    isVendor: boolean;
    hasPlan: boolean;
    reset_password_token: string | null;
    reset_password_expires: string | null;
    gender: string;
    is_active: boolean;
    status: string;
    is_blocked: boolean;
    password: string;
    createdAt: string;
    updatedAt: string;
    country: string | null;
    state: string | null;
    recipientCode: string | null;
    role: string;
    latitude: number | null;
    longitude: number | null;
    location_name: string | null;
    accountType: string;
    paymentGatewayId: string | null;
    emailVerified: boolean | null;
    image: string | null;
  };
}

interface EventVendor {
  id: number;
  EventId: number;
  VendorId: number;
  createdAt: string;
  updatedAt: string;
  Vendor: Vendor;
}

interface EventType {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  eventCategoriesId: number;
}

interface User {
  id: number;
  username: string;
  bio: string | null;
  timezone: string | null;
  avatar: string | null;
  phone: string | null;
  email: string;
  first_name: string;
  last_name: string;
  isVendor: boolean;
  hasPlan: boolean;
  reset_password_token: string | null;
  reset_password_expires: string | null;
  gender: string;
  is_active: boolean;
  status: string;
  is_blocked: boolean;
  password: string;
  createdAt: string;
  updatedAt: string;
  country: string | null;
  state: string | null;
  recipientCode: string | null;
  role: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  accountType: string;
  paymentGatewayId: string | null;
  emailVerified: boolean | null;
  image: string | null;
}

interface SeatArrangement {
  id: number;
  eventId: number;
  NumOfTables: number;
  NumOfGuests: number;
}

interface Bookmark {
  id: number;
  userId: number;
  eventId: number;
  createdAt: string;
  updatedAt: string;
}

interface EventCount {
  views: number;
}

export interface IEvents {
  id: number;
  date: string;
  createdAt: string;
  updatedAt: string;
  country: string;
  state: string;
  title: string;
  media: Media[];
  status: string;
  address: string;
  capacity: number;
  description: string;
  organizer: string;
  event_types: number;
  isAllDay: boolean;
  duration: number;
  isRecurring: boolean;
  rrule: string | null;
  end: string;
  endTime: string;
  isActive: boolean;
  event_ticketing: string;
  UserId: number;
  externalLink: string | null;
  eventLocationType: string;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  privacy: string;
  eventCategoriesId: number;
  event_MediaId: string | null;
  Event_Vendors: EventVendor[];
  Event_Plans: unknown[]; // Assuming this is an array of some kind, but no details were provided
  Event_Types: EventType;
  User: User;
  Seat_Arrangement: SeatArrangement;
  Bookmark: Bookmark;
  Event_Attendees: unknown[]; // Assuming this is an array of some kind, but no details were provided
  _count: EventCount;
}
