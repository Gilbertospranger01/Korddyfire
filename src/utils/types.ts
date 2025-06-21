export type User = {
  id: string;
  username: string; 
  email?: string;
  picture_url?: string;
};

export type ChatMessage = {
  id?: string; 
  user_id?: string; 
  receiver_id?: string;
  username?: string; 
  message: string;  
  viewed?: boolean;
  created_at: string;
}


