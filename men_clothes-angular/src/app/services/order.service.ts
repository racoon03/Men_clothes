import { ProductService } from './product.service';
import { Injectable } from '@angular/core';
import { HttpClient,   HttpParams, 
 HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/enviroment';
import { OrderDTO } from '../dtos/order/order.dto';
import { OrderResponse } from '../components/responses/order/order.response';
import { CartItem } from '../models/cart.item';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiBaseUrl}/orders`;
  private apiGetAllOrders = `${environment.apiBaseUrl}/orders/get-orders-by-keyword`;
  // Phí vận chuyển mặc định
  private expressShippingCost: number = 30000; // 30,000 VND
  private normalShippingCost: number = 15000; // 15,000 VND


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

  getOrderByUserId(userId: number): Observable<any> {
    const url = `${environment.apiBaseUrl}/orders/user/${userId}`;
    return this.http.get(url);
  }

  getPagedOrdersByUserId(userId: number, page: number = 0, size: number = 5): Observable<any> {
  return this.http.get<any>(
    `${this.apiUrl}/user/${userId}/paged?page=${page}&size=${size}`
  );
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/orders/status/${orderId}`;
    return this.http.put(url, { status });
  }

  // Phương thức tiện ích để hủy đơn hàng
  cancelOrder(orderId: number): Observable<any> {
    return this.updateOrderStatus(orderId, 'CANCELLED');
  }


  // xử lý cập nhật trạng thái đon hàng
  // Thêm vào OrderService

  /**
   * Cập nhật trạng thái của đơn hàng
   * @param orderId - ID của đơn hàng cần cập nhật
   * @param status - Trạng thái mới của đơn hàng (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
   * @returns Observable chứa kết quả cập nhật
   */


  /**
   * Kiểm tra xem có thể chuyển từ trạng thái hiện tại sang trạng thái mới không
   * @param currentStatus - Trạng thái hiện tại của đơn hàng
   * @param newStatus - Trạng thái mới muốn chuyển sang
   * @returns true nếu việc chuyển trạng thái hợp lệ, ngược lại false
   */
  isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
    // Chuyển cả hai trạng thái về chữ thường để so sánh không phân biệt hoa thường
    const current = currentStatus?.toLowerCase();
    const next = newStatus?.toLowerCase();
    
    // Logic cho phép chuyển đổi trạng thái
    switch (current) {
      case 'pending':
        // Từ Pending có thể chuyển sang Processing hoặc Cancelled
        return ['processing', 'cancelled'].includes(next);
      case 'processing':
        // Từ Processing có thể chuyển sang Shipped hoặc Cancelled
        return ['shipped', 'cancelled'].includes(next);
      case 'shipped':
        // Từ Shipped chỉ có thể chuyển sang Delivered
        return ['delivered'].includes(next);
      case 'delivered':
      case 'cancelled':
        // Đã giao hàng hoặc Đã hủy là trạng thái cuối, không thể chuyển đổi
        return false;
      default:
        return false;
    }
  }

  /**
   * Lấy danh sách trạng thái có thể chuyển sang từ trạng thái hiện tại
   * @param currentStatus - Trạng thái hiện tại của đơn hàng
   * @returns Mảng các trạng thái có thể chuyển sang
   */
  getAvailableStatusTransitions(currentStatus: string): { value: string, label: string }[] {
    const allStatuses = [
      { value: 'PENDING', label: 'Chờ xử lý' },
      { value: 'PROCESSING', label: 'Đang xử lý' },
      { value: 'SHIPPED', label: 'Đang vận chuyển' },
      { value: 'DELIVERED', label: 'Đã giao hàng' },
      { value: 'CANCELLED', label: 'Đã hủy' }
    ];
    
    // Lọc các trạng thái có thể chuyển sang từ trạng thái hiện tại
    return allStatuses.filter(status => 
      this.isValidStatusTransition(currentStatus, status.value)
    );
  }

  /**
   * Chuyển đổi mã trạng thái thành text hiển thị
   * @param status - Mã trạng thái
   * @returns Text hiển thị của trạng thái
   */
  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang vận chuyển';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'Không xác định';
    }
  }

  /**
   * Tính phí vận chuyển dựa trên phương thức vận chuyển
   * @param shippingMethod - Phương thức vận chuyển ('express' hoặc 'normal')
   * @returns Phí vận chuyển tương ứng
   */
  calculateShippingCost(shippingMethod: string): number {
    return shippingMethod === 'express' ? this.expressShippingCost : this.normalShippingCost;
  }

  /**
   * Lấy giá trị phí vận chuyển nhanh
   * @returns Phí vận chuyển nhanh
   */
  getExpressShippingCost(): number {
    return this.expressShippingCost;
  }

  /**
   * Lấy giá trị phí vận chuyển tiêu chuẩn
   * @returns Phí vận chuyển tiêu chuẩn
   */
  getNormalShippingCost(): number {
    return this.normalShippingCost;
  }

  /**
   * Áp dụng mã giảm giá và tính số tiền giảm
   * @param couponCode - Mã giảm giá
   * @param subtotal - Tổng tiền hàng chưa tính phí vận chuyển
   * @returns Số tiền được giảm
   * Trong thực tế, nên gọi API để kiểm tra và áp dụng mã giảm giá
   */
  applyCoupon(couponCode: string, subtotal: number): number {
    // Giả lập kiểm tra mã giảm giá
    if (couponCode === 'SALE10') {
      return subtotal * 0.1; // Giảm 10%
    }
    
    if (couponCode === 'SALE20') {
      return subtotal * 0.2; // Giảm 20%
    }
    
    return 0; // Mã không hợp lệ, không giảm giá
  }

  /**
   * Chuẩn bị dữ liệu đơn hàng từ form và giỏ hàng
   * @param formValue - Giá trị từ form đặt hàng
   * @param userData - Thông tin người dùng
   * @param selectedItems - Danh sách sản phẩm đã chọn
   * @param totalMoney - Tổng tiền thanh toán
   * @param couponCode - Mã giảm giá (nếu có)
   * @returns Đối tượng OrderDTO để gửi lên server
   */
  prepareOrderData(formValue: any, userData: any, selectedItems: CartItem[], totalMoney: number, couponCode: string): OrderDTO {
    return {
      user_id: userData?.id || 0,
      fullname: formValue.fullname,
      email: formValue.email,
      phone_number: formValue.phone_number,
      address: formValue.address,
      note: formValue.note,
      total_money: totalMoney,
      payment_method: formValue.payment_method,
      shipping_method: formValue.shipping_method,
      coupon_code: couponCode,
      cart_items: selectedItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color_id: item.color_id,
        size_id: item.size_id
      }))
    };
  }

  /**
   * Tính tổng tiền đơn hàng
   * @param subtotal - Tổng tiền hàng
   * @param shippingCost - Phí vận chuyển
   * @param discountAmount - Số tiền giảm giá
   * @returns Tổng tiền thanh toán
   */
  calculateTotal(subtotal: number, shippingCost: number, discountAmount: number): number {
    return subtotal + shippingCost - discountAmount;
  }
  
}