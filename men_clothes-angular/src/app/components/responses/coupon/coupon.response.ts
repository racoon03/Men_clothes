export interface CouponResponse {
  id: number;
  category_id: number;
  content: string;
  codecp: string;
  discount: number;
  startday: string; 
  endday: string;   
  created_at: string;
  updated_at: string;
}