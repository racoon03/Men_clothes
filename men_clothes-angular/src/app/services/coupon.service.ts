import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { TokenService } from './token.service';
import { HttpUtilService } from './http.util.service';
import { CouponDTO } from '../dtos/coupon/coupon.dto';
import { CouponResponse } from '../components/responses/coupon/coupon.response';
import { CouponListResponse } from '../components/responses/coupon/coupon.list.response';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = `${environment.apiBaseUrl}/coupons`;

  constructor(
    private http: HttpClient,
    private httpUtilService: HttpUtilService,
    private tokenService: TokenService
  ) { }

  // Tạo mới coupon
  createCoupon(couponData: CouponDTO): Observable<CouponResponse> {
    return this.http.post<CouponResponse>(this.apiUrl, couponData, {
        headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
        })
    });
}

  // Xóa coupon
  deleteCoupon(couponId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${couponId}`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      }),
      responseType: 'text' as 'json'
    });
  }

  // Lấy các coupon khả dụng
  getAvailableCoupons(categoryId: number, dateStr?: string): Observable<any> {
    let params = new HttpParams().set('categoryId', categoryId.toString());
    
    if (dateStr) {
      params = params.set('dateStr', dateStr);
    }
    
    return this.http.get<any>(`${this.apiUrl}/available`, { params });
  }

  getCoupons(
    page: number = 1, 
    limit: number = 10, 
    keyword: string = '', 
    categoryId: number = 0
  ): Observable<CouponListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    
    if (categoryId > 0) {
      params = params.set('category_id', categoryId.toString());
    }
    
    return this.http.get<CouponListResponse>(`${this.apiUrl}/all`, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      }),
      params: params
    });
  }

  // Mở rộng thời gian áp dụng coupon
  extendCoupon(couponId: number, newEndDate: string): Observable<CouponResponse> {
    const params = new HttpParams().set('newEndDate', newEndDate);
    return this.http.put<CouponResponse>(`${this.apiUrl}/extend/${couponId}`, null, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenService.getToken()}`
      }),
      params: params
    });
  }
}