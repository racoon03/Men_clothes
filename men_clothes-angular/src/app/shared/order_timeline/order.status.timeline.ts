import { Component, OnInit, Input } from '@angular/core';
import { OrderResponse } from '../../components/responses/order/order.response';

interface OrderStatusHistory {
  status: string;
  date: Date;
  step: number;
}

@Component({
  selector: 'app-order-status-timeline',
  templateUrl: './order.status.timeline.html',
  styleUrls: ['./order.status.timeline.scss']
})
export class OrderStatusTimelineComponent implements OnInit {
  @Input() orderResponse: OrderResponse | null = null;
  
  currentStep: number = 1;
  orderStatusHistory: OrderStatusHistory[] = [];
  
  constructor() {}

  ngOnInit(): void {
    this.generateOrderStatusHistory();
  }
  

  
  // Tạo lịch sử trạng thái đơn hàng dựa trên dữ liệu từ response
  generateOrderStatusHistory(): void {
    if (!this.orderResponse) return;
    
    // Reset
    this.orderStatusHistory = [];
    
    // Luôn có bước đầu tiên là "Đơn Hàng Đã Đặt"
    this.orderStatusHistory.push({
      status: 'PENDING',
      date: this.orderResponse.order_date,
      step: 1
    });
    
    // Kiểm tra trạng thái hiện tại và tạo lịch sử phù hợp
    // Thông thường bạn sẽ có thêm thông tin lịch sử từ backend
    // Đây là phần mô phỏng dựa trên trạng thái hiện tại
    const status = this.orderResponse.status.toLowerCase();
    
    if (status === 'pending' || status === 'chờ xác nhận') {
      this.currentStep = 1;
      return;
    }
    
    // Nếu đã thanh toán, thêm bước này vào lịch sử
    const paymentDate = new Date(this.orderResponse.order_date);
    paymentDate.setHours(paymentDate.getHours() + 1); // Giả định thanh toán 1 giờ sau khi đặt hàng
    
    this.orderStatusHistory.push({
      status: 'PAID',
      date: paymentDate,
      step: 2
    });
    
    if (status === 'paid' || status === 'đã thanh toán') {
      this.currentStep = 2;
      return;
    }
    
    // Nếu đã giao cho đơn vị vận chuyển
    const shippingDate = new Date(paymentDate);
    shippingDate.setHours(shippingDate.getHours() + 12); // Giả định giao cho ĐVVC 12 giờ sau khi thanh toán
    
    this.orderStatusHistory.push({
      status: 'PROCESSING',
      date: shippingDate,
      step: 3
    });
    
    if (status === 'processing' || status === 'đang xử lý') {
      this.currentStep = 3;
      return;
    }
    
    // Nếu đang giao hàng
    const deliveringDate = new Date(this.orderResponse.shipping_date);
    
    this.orderStatusHistory.push({
      status: 'SHIPPED',
      date: deliveringDate,
      step: 4
    });
    
    if (status === 'shipped' || status === 'đang giao hàng') {
      this.currentStep = 4;
      return;
    }
    
    // Nếu đã giao hàng thành công
    const deliveredDate = new Date(deliveringDate);
    deliveredDate.setDate(deliveredDate.getDate() + 1); // Giả định giao hàng thành công 1 ngày sau khi bắt đầu giao
    
    this.orderStatusHistory.push({
      status: 'DELIVERED',
      date: deliveredDate,
      step: 5
    });
    
    if (status === 'delivered' || status === 'đã giao hàng') {
      this.currentStep = 5;
    }
  }
  
  // Kiểm tra xem bước có đang active không
  isStepActive(step: number): boolean {
    return step === this.currentStep;
  }
  
  // Kiểm tra xem bước đã hoàn thành chưa
  isStepCompleted(step: number): boolean {
    return step < this.currentStep;
  }
  
  // Kiểm tra xem có phải bước cuối cùng không
  isLastStep(step: number): boolean {
    return step === 5;
  }
  
  // Lấy ngày của một bước
  getStepDate(step: number): Date | null {
    const statusEntry = this.orderStatusHistory.find(entry => entry.step === step);
    return statusEntry ? statusEntry.date : null;
  }
  
  // Hiển thị trạng thái đơn hàng
  getStatusText(): string {
    if (!this.orderResponse) return '';
    
    const status = this.orderResponse.status.toLowerCase();
    
    switch(status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'paid':
        return 'Đã thanh toán';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return this.orderResponse.status;
    }
  }
}