import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from 'src/app/services/order.service';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderDTO } from 'src/app/dtos/order/order.dto';
import { environment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-detail-order-admin',
  templateUrl: './detail.order.admin.component.html',
  styleUrls: ['./detail.order.admin.component.scss']
})
export class DetailOrderAdminComponent implements OnInit {    
  orderId: number = 0;
  orderResponse: OrderResponse = {
    id: 0,
    user_id: 0,
    fullname: '',
    phone_number: '',
    email: '',
    address: '',
    note: '',
    order_date: new Date(),
    status: '',
    total_money: 0, 
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    payment_method: '',
    order_details: [],
  };
  
  // Lưu trạng thái trước khi thay đổi để so sánh
  previousStatus: string = '';
  showStatusConfirmModal: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';
  
  // Danh sách trạng thái có thể chuyển đổi từ trạng thái hiện tại
  availableStatuses: {value: string, label: string}[] = [];

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.getOrderDetails();
  }
  
  /**
   * Lấy chi tiết đơn hàng từ API
   */
  getOrderDetails(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(this.orderId) || this.orderId <= 0) {
      console.error('Invalid order ID:', this.orderId);
      this.router.navigate(['/admin/orders']);
      return;
    }
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: any) => {
        console.log("Raw response:", response);
        this.orderResponse = this.processOrderResponse(response);
        this.previousStatus = this.orderResponse.status;
        this.availableStatuses = this.orderService.getAvailableStatusTransitions(this.previousStatus);
        console.log('Order details loaded:', this.orderResponse);
        console.log('Available status transitions:', this.availableStatuses);
      },
      error: (error: any) => {
        console.error('Error fetching order details:', error);
        // Hiển thị thông báo lỗi cho người dùng
        alert('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
      }
    });
  }
  
  /**
   * Xử lý dữ liệu đơn hàng từ API
   */
  private processOrderResponse(response: any): OrderResponse {
    // Xử lý ngày tháng từ mảng nếu cần
    let orderDate = new Date();
    if (response.order_date) {
      if (Array.isArray(response.order_date)) {
        // Nếu order_date là mảng [year, month, day]
        orderDate = new Date(
          response.order_date[0], 
          response.order_date[1] - 1, // Tháng trong JS bắt đầu từ 0
          response.order_date[2]
        );
      } else if (typeof response.order_date === 'string') {
        // Nếu order_date là chuỗi
        orderDate = new Date(response.order_date);
      }
    }

    let shippingDate = new Date();
    if (response.shipping_date) {
      if (Array.isArray(response.shipping_date)) {
        // Nếu shipping_date là mảng [year, month, day]
        shippingDate = new Date(
          response.shipping_date[0], 
          response.shipping_date[1] - 1, 
          response.shipping_date[2]
        );
      } else if (typeof response.shipping_date === 'string') {
        // Nếu shipping_date là chuỗi
        shippingDate = new Date(response.shipping_date);
      }
    }

    // Xử lý order_details và thêm đường dẫn đầy đủ cho hình ảnh
    const orderDetails = response.order_details ? response.order_details.map((detail: any) => {
      // Đảm bảo rằng product thumbnail có URL đầy đủ
      if (detail.product && detail.product.thumbnail) {
        detail.product.thumbnail = `${environment.apiBaseUrl}/products/images/${detail.product.thumbnail}`;
      }
      // Đảm bảo number_of_products được đặt đúng
      if (detail.numberOfProducts !== undefined && detail.number_of_products === undefined) {
        detail.number_of_products = detail.numberOfProducts;
      }
      return detail;
    }) : [];

    const orderResponse: OrderResponse = {
      id: response.id,
      user_id: response.user_id,
      fullname: response.fullname,
      email: response.email,
      phone_number: response.phone_number,
      address: response.address,
      note: response.note,
      total_money: response.total_money,
      status: response.status?.toLowerCase() || '',
      payment_method: response.payment_method,
      shipping_method: response.shipping_method,
      shipping_address: response.shipping_address || response.address,
      order_date: orderDate,
      shipping_date: shippingDate,
      order_details: orderDetails
    };
    
    return orderResponse;
  }
  
  
  
  /**
   * Hủy thay đổi trạng thái
   */
  cancelStatusChange(): void {
    // Khôi phục trạng thái trước đó
    this.orderResponse.status = this.previousStatus;
    this.showStatusConfirmModal = false;
  }
  
  /**
   * Xử lý khi trạng thái đơn hàng thay đổi
   */
  onStatusChange(): void {
    console.log('Status changed from', this.previousStatus, 'to', this.orderResponse.status);
    
    // Kiểm tra tính hợp lệ của việc chuyển trạng thái
    const isValidTransition = this.orderService.isValidStatusTransition(
      this.previousStatus, 
      this.orderResponse.status
    );
    
    if (!isValidTransition) {
      this.errorMessage = `Không thể chuyển từ trạng thái "${this.getStatusText(this.previousStatus)}" sang "${this.getStatusText(this.orderResponse.status)}"`;
      
      // Khôi phục trạng thái trước đó
      this.orderResponse.status = this.previousStatus;
      return;
    }
    
    // Xóa thông báo lỗi nếu chuyển trạng thái hợp lệ
    this.errorMessage = '';
  }
  
  /**
   * Lưu thay đổi trạng thái đơn hàng
   */
  saveOrder(): void {
    console.log('Saving order with status:', this.orderResponse.status);
    
    // Kiểm tra xem trạng thái có thay đổi không
    if (this.previousStatus.toLowerCase() === this.orderResponse.status.toLowerCase()) {
      alert('Không có thay đổi nào được thực hiện.');
      return;
    }
    
    // Kiểm tra tính hợp lệ của việc chuyển trạng thái
    const isValidTransition = this.orderService.isValidStatusTransition(
      this.previousStatus, 
      this.orderResponse.status
    );
    
    if (!isValidTransition) {
      this.errorMessage = `Không thể chuyển từ trạng thái "${this.getStatusText(this.previousStatus)}" sang "${this.getStatusText(this.orderResponse.status)}"`;
      this.orderResponse.status = this.previousStatus;
      return;
    }
    
    // Bắt đầu quá trình lưu
    this.isSaving = true;
    this.errorMessage = '';
    
    // Gọi service để cập nhật trạng thái
    this.orderService.updateOrderStatus(this.orderId, this.orderResponse.status)
      .subscribe({
        next: (response) => {
          console.log('Status updated successfully:', response);
          
          // Cập nhật trạng thái trước đó
          this.previousStatus = this.orderResponse.status;
          
          // Kết thúc quá trình lưu
          this.isSaving = false;
          
          // Thông báo thành công
          alert('Trạng thái đơn hàng đã được cập nhật thành công!');
        },
        error: (error) => {
          console.error('Error updating status:', error);
          
          // Xử lý lỗi
          const errorMessage = error.error?.message || 
                               error.message || 
                               'Lỗi không xác định khi cập nhật trạng thái';
          
          this.errorMessage = errorMessage;
          
          // Khôi phục trạng thái ban đầu
          this.orderResponse.status = this.previousStatus;
          this.isSaving = false;
        }
      });
  }
  
  
  /**
   * Tính tổng tiền của đơn hàng
   */
  calculateTotalAmount(): number {
    return this.orderResponse.order_details.reduce((total, detail) => {
      return total + (detail.price * detail.number_of_products);
    }, 0);
  }
  
  /**
   * Kiểm tra trạng thái đang active
   */
  isStatusActive(status: string): boolean {
    return this.orderResponse.status.toLowerCase() === status.toLowerCase();
  }
  
  /**
   * Kiểm tra trạng thái đã hoàn thành (đã qua)
   */
  isStatusCompleted(status: string): boolean {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.orderResponse.status.toLowerCase());
    const checkIndex = statusOrder.indexOf(status.toLowerCase());
    
    // Nếu đơn hàng bị hủy, không có trạng thái nào được coi là hoàn thành
    if (this.orderResponse.status.toLowerCase() === 'cancelled') {
      return false;
    }
    
    // Nếu trạng thái hiện tại hợp lệ và trạng thái kiểm tra có trước trạng thái hiện tại
    return currentIndex > -1 && checkIndex > -1 && checkIndex < currentIndex;
  }
  
  /**
   * Lấy class CSS cho badge trạng thái
   */
  getStatusClass(): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'pending',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    return statusMap[this.orderResponse.status.toLowerCase()] || 'pending';
  }
  
  /**
   * Lấy text cho trạng thái đơn hàng
   */
  getStatusText(status: string): string {
    return this.orderService.getStatusText(status);
  }
  
  /**
   * Lấy text cho phương thức thanh toán
   */
  getPaymentMethodText(method: string): string {
    if (!method) return 'Không xác định';
    
    const methodMap: {[key: string]: string} = {
      'cod': 'Tiền mặt (COD)',
      'vnpay': 'VNPay',
      'momo': 'Ví MoMo',
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'credit_card': 'Thẻ tín dụng/ghi nợ'
    };
    
    return methodMap[method.toLowerCase()] || method;
  }
  
  /**
   * Quay lại trang trước
   */
  goBack(): void {
    this.location.back();
  }
}