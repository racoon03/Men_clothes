import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { environment } from '../../enviroments/enviroment';
import { OrderDTO } from '../../dtos/order/order.dto';
import { OrderResponse } from '../responses/order/order.response';
import { OrderDetail } from '../..//models/order.detail';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order.detail.component.html',
  styleUrls: ['./order.detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  orderId: number | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  
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
    order_details: []
  };
  
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Lấy id từ URL parameter
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.orderId = +idParam;
        this.getOrderDetails(this.orderId);
      } else {
        this.isLoading = false;
        this.errorMessage = 'Không tìm thấy mã đơn hàng';
      }
    });
  }

  // Thêm hàm này ngay trong class OrderDetailComponent
private mapOrderDetail(rawOrderDetail: any): OrderDetail {
  return {
    ...rawOrderDetail,
    number_of_products: rawOrderDetail.numberOfProducts || 0,
    total_money: rawOrderDetail.totalMoney || rawOrderDetail.price || 0,
    product: {
      ...rawOrderDetail.product,
      thumbnail: rawOrderDetail.product?.thumbnail?.startsWith('http') 
        ? rawOrderDetail.product.thumbnail 
        : `${environment.apiBaseUrl}/products/images/${rawOrderDetail.product.thumbnail}`
    }
  };
}
  

  getOrderDetails(orderId: number): void {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (response: any) => {

         // In nội dung API trả về trong console
      console.log('API Response:', response);
        // Xử lý dữ liệu response
        this.orderResponse.id = response.id;
        this.orderResponse.user_id = response.user_id;
        this.orderResponse.fullname = response.fullname;
        this.orderResponse.email = response.email;
        this.orderResponse.phone_number = response.phone_number;
        this.orderResponse.address = response.address;
        this.orderResponse.note = response.note;
        
        // Xử lý ngày tháng
        if (response.order_date && Array.isArray(response.order_date) && response.order_date.length >= 3) {
          this.orderResponse.order_date = new Date(
            response.order_date[0],
            response.order_date[1] - 1,
            response.order_date[2]
          );
        }
        
        // Xử lý order details và URL hình ảnh
        if (response.order_details && Array.isArray(response.order_details)) {
          this.orderResponse.order_details = response.order_details.map((order_detail: OrderDetail) => {
            if (order_detail.product && order_detail.product.thumbnail) {
              // Kiểm tra nếu thumbnail đã có full URL
              if (!order_detail.product.thumbnail.startsWith('http')) {
                order_detail.product.thumbnail = `${environment.apiBaseUrl}/products/images/${order_detail.product.thumbnail}`;
              }
            }
          
            return this.mapOrderDetail(order_detail);
          });
        }
        
        this.orderResponse.payment_method = response.payment_method;
        
        // Xử lý ngày giao hàng
        if (response.shipping_date && Array.isArray(response.shipping_date) && response.shipping_date.length >= 3) {
          this.orderResponse.shipping_date = new Date(
            response.shipping_date[0],
            response.shipping_date[1] - 1,
            response.shipping_date[2]
          );
        }
        
        this.orderResponse.shipping_method = response.shipping_method;
        this.orderResponse.status = response.status;
        this.orderResponse.total_money = response.total_money;
        
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error fetching order details:', error);
        this.errorMessage = 'Đã xảy ra lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau.';
      }
    });
  }

  // Phương thức để lấy class CSS dựa trên trạng thái đơn hàng
  getStatusClass(): string {
    const status = this.orderResponse.status.toLowerCase();
    
    switch (status) {
      case 'pending':
      case 'chờ xác nhận':
        return 'status-pending';
      case 'processing':
      case 'đang xử lý':
        return 'status-processing';
      case 'shipped':
      case 'đang giao hàng':
        return 'status-shipped';
      case 'delivered':
      case 'đã giao hàng':
        return 'status-delivered';
      case 'cancelled':
      case 'đã hủy':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  

  // Phương thức để hiển thị text trạng thái tiếng Việt
  getStatusText(): string {
    const status = this.orderResponse.status.toLowerCase();
    
    switch(status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return this.orderResponse.status;
    }
  }

  // Lấy phí vận chuyển
  getShippingFee(): number {
    const subtotal = 30000;
    // Giả định rằng tổng tiền = tạm tính + phí vận chuyển
    return this.orderResponse.total_money + subtotal;
  }

  // Quay lại trang trước
  // goBack(): void {
  //   this.location.back();
  // }

  // In đơn hàng
  printOrder(): void {
    window.print();
  }
}
