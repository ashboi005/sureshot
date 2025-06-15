export type User ={
  id: string;
  user_id: string;
  email: string;
  username: string;
  account_type: string; // 'user', 'doctor', 'admin', etc.
  baby_name: string;
  baby_date_of_birth: string; // or Date if you'll convert the string to Date object
  parent_name: string;
  parent_mobile: string;
  parent_email: string;
  gender: string;
  blood_group: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  avatar_url: string;
  created_at: string; // or Date
  updated_at: string; // or Date
  
  // Optional fields for doctor account
  doctor_id?: string;
  specialization?: string;
  hospital_affiliation?: string;
}