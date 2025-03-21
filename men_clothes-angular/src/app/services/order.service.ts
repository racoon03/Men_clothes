import { ProductService } from './product.service';
import { Injectable } from '@angular/core';
import { HttpClient,   HttpParams, 
 HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { OrderDTO } from '../dtos/order/order.dto';
import { OrderResponse } from '../components/responses/order/order.response';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;
    private apiGetAllOrders = `${environment.apiBaseUrl}/orders/get-orders-by-keyword`;


  constructor(private http: HttpClient) {}

  placeOrder(orderData: OrderDTO): Observable<any> {    
    // Gửi yêu cầu đặt hàng
    return this.http.post(this.apiUrl, orderData);
  }
  getOrderById(orderId: number): Observable<any> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.get(url);
  }

  getAllOrders(keyword:string,
    page: number, limit: number
  ): Observable<OrderResponse[]> {
      const params = new HttpParams()
      .set('keyword', keyword)      
      .set('page', page.toString())
      .set('limit', limit.toString());            
      return this.http.get<any>(this.apiGetAllOrders, { params });
  }
  updateOrder(orderId: number, orderData: OrderDTO): Observable<any> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.put(url, orderData);
  }
  deleteOrder(orderId: number): Observable<any> {
    const url = `${environment.apiBaseUrl}/orders/${orderId}`;
    return this.http.delete(url, { responseType: 'text' });
  }

   // Bổ sung hàm cập nhật trạng thái đơn hàng
  //muốn truyền orderId hoặc id từ vnpay đều được
  // updateOrderStatus(orderId: number, status: string): Observable<ApiResponse> {
  //   const url = `${environment.apiBaseUrl}/orders/${orderId}/status`;
  //   const params = new HttpParams().set('status', status); // Thêm tham số status vào query params
  //   return this.http.put<ApiResponse>(url, null, { params }); // Gửi yêu cầu PUT với tham số status
  // }
}