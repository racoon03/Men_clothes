import { Product } from './product';

/**
 * Định nghĩa interface cho các item trong giỏ hàng
 */
export interface CartItem {
  product: Product;
  quantity: number;
  color_id?: number;
  size_id?: number;
  selected?: boolean;
}