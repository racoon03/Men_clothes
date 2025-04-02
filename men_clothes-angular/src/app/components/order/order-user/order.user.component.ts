import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { TokenService } from '../../../services/token.service';
import { Order } from '../../../models/order';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-user',
  templateUrl: './order.user.component.html',
  styleUrls: ['./order.user.component.scss']
})
export class OrderUserComponent implements OnInit {
  orders: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Pagination variables
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  constructor(
    private orderService: OrderService,
    private tokenService: TokenService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const userIdStr = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (!userIdStr) {
      this.error = 'Bạn cần đăng nhập để xem đơn hàng';
      this.isLoading = false;
      return;
    }

    // Chuyển đổi từ string sang number
    const userId = Number(userIdStr);
    
    if (isNaN(userId)) {
      this.error = 'ID người dùng không hợp lệ';
      this.isLoading = false;
      return;
    }

    // Log để debug
    console.log('Loading orders for user ID:', userId);
    console.log('Current page:', this.currentPage);
    console.log('Page size:', this.pageSize);

    this.orderService.getPagedOrdersByUserId(userId, this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          // Kiểm tra xem response có đúng định dạng không
          console.log('API Response:', response);
          
          if (response && Array.isArray(response.orders)) {
            this.orders = response.orders;
            this.currentPage = response.currentPage;
            this.totalItems = response.totalItems;
            this.totalPages = response.totalPages;
            
            // Đảm bảo totalPages ít nhất là 1 nếu có dữ liệu
            if (this.orders && this.orders.length > 0 && this.totalPages < 1) {
              this.totalPages = 1;
            }
            
            console.log('Orders loaded:', this.orders);
            console.log('Total pages:', this.totalPages);
          } else if (Array.isArray(response)) {
            // Trường hợp API chỉ trả về mảng đơn hàng mà không có thông tin phân trang
            this.orders = response;
            this.totalItems = response.length;
            this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
            console.log('Orders loaded (array format):', this.orders);
          } else {
            console.error('Unexpected API response format:', response);
            this.error = 'Định dạng dữ liệu không hợp lệ';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching orders:', error);
          this.error = 'Không thể tải đơn hàng. Vui lòng thử lại sau.';
        }
      });
  }

  // Phân tích chuỗi ngày từ API thành đối tượng Date
  parseOrderDate(orderDate: any): Date {
    if (Array.isArray(orderDate)) {
      // Format từ API: [2025, 3, 21]
      return new Date(orderDate[0], orderDate[1] - 1, orderDate[2]);
    } else if (orderDate instanceof Date) {
      return orderDate;
    } else {
      return new Date(orderDate);
    }
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method?.toLowerCase()) {
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'vnpay':
        return 'Thanh toán qua VNPay';
      case 'banking':
        return 'Chuyển khoản ngân hàng';
      default:
        return method || '';
    }
  }

  canCancelOrder(status: string): boolean {
    // Chỉ cho phép hủy đơn hàng khi đơn hàng đang ở trạng thái chờ xử lý
    return status?.toLowerCase() === 'pending';
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrders(); // Gọi lại API để tải dữ liệu trang mới
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    // Hiển thị tối đa 5 trang 
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      // Nếu tổng số trang <= 5, hiển thị tất cả
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Tính toán các trang sẽ hiển thị
      let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;
      
      if (endPage >= this.totalPages) {
        endPage = this.totalPages - 1;
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  getProductThumbnail(order: any): string {
    if (order.orderDetails && order.orderDetails.length > 0 && order.orderDetails[0].product) {
      const thumbnail = order.orderDetails[0].product.thumbnail;
      return thumbnail ? `${environment.apiBaseUrl}/products/images/${thumbnail}` : 'assets/images/placeholder.jpg';
    }
    return 'assets/images/placeholder.jpg';
  }

  getFirstProductName(order: any): string {
    if (order.orderDetails && order.orderDetails.length > 0 && order.orderDetails[0].product) {
      return order.orderDetails[0].product.name;
    }
    return 'Không có thông tin sản phẩm';
  }

  getOrderItemsCount(order: any): number {
    return order.orderDetails?.length || 0;
  }

  // Định dạng ngày đặt hàng
  formatOrderDate(orderDate: any): string {
    const date = this.parseOrderDate(orderDate);
    return date.toLocaleDateString('vi-VN');
  }

  // Trong OrderUserComponent
  cancelOrder(orderId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      this.orderService.cancelOrder(orderId)
        .subscribe({
          next: (response) => {
            // Cập nhật UI
            const orderIndex = this.orders.findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
              this.orders[orderIndex].status = 'CANCELLED';
            }
            alert('Đơn hàng đã được hủy thành công');
          },
          error: (error: HttpErrorResponse) => {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert('Không thể hủy đơn hàng. Vui lòng thử lại sau.');
          }
        });
    }
  }
}