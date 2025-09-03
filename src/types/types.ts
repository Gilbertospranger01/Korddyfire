export type User = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  picture_url?: string;
  full_name?: string;
  nickname?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  slug?: string;
  provider_id?: string;
  provider?: string;
  provider_type?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  password?: string;
  nationality?: string;
  terms_and_policies?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  [key: string]: unknown; 
};


export type ChatMessage = {
  id?: string; 
  user_id?: string; 
  receiver_id?: string;
  username?: string; 
  message: string;  
  viewed?: boolean; 
  created_at: string;
};
