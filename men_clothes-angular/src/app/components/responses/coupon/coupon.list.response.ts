import { CouponResponse } from './coupon.response';
export interface CouponListResponse {
  coupons: CouponResponse[];
  total_pages: number;
}