// Define the Address block separately for reusability (e.g., if the Order Service needs to reference an address)
export interface IAddress {
  isDefault: boolean;
  label: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Pure data representation of the User
export interface IUser {
  id: string; // Normalized from Mongoose's '_id' for cross-service communication
  email: string;
  role: 'customer' | 'admin';
  firstName?: string;
  lastName?: string;
  phone?: string;
  savedAddresses: IAddress[];
  
  // Dates are often converted to ISO strings when passed over HTTP/JSON
  createdAt: Date | string; 
  updatedAt: Date | string;
}

// What the React frontend sends to POST /api/auth/otp-request
export interface IOtpRequestPayload {
  email: string;
}

// What the React frontend sends to POST /api/auth/otp-verify
export interface IOtpVerifyPayload {
  email: string;
  otp: string;
}

// What the User Service returns upon successful verification
export interface IAuthResponse {
  token: string;
  user: {
    email: string;
    role: 'customer' | 'admin';
    firstName?: string;
  };
}