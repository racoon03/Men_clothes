import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { ApiResponse } from '../responses/api.responses';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.component.html', // Tách riêng HTML
  styleUrls: ['./payment-callback.component.scss']
})
export class PaymentCallbackComponent extends BaseComponent implements OnInit { // Kế thừa BaseComponent
  loading: boolean = true;
    paymentSuccess: boolean = false;

  ngOnInit(): void {
    // Sử dụng this.activatedRoute từ BaseComponent
    this.activatedRoute.queryParams.subscribe(params => {
      debugger
      const vnp_ResponseCode = params['vnp_ResponseCode']; // Mã phản hồi từ VNPay
      const orderId:number = Number(params['vnp_TxnRef']); // Mã đơn hàng (nếu bạn truyền vào khi tạo URL thanh toán)
      debugger
      if (vnp_ResponseCode === '00') {
        // Thanh toán thành công
        this.handlePaymentSuccess(orderId);
      } else {
        // Thanh toán thất bại
        this.handlePaymentFailure();
      }
    });
  }

  handlePaymentSuccess(orderId: number): void {    
    this.loading = false;
    this.paymentSuccess = true;
    alert('Thanh toán thành công!');
    // Sử dụng this.router từ BaseComponent để chuyển hướng
    setTimeout(() => {
        debugger
        this.cartService.clearCart();
        this.router.navigate(['/']);
    }, 3000);
  }

  handlePaymentFailure(): void {
    this.loading = false;
    this.paymentSuccess = false;
    alert('Thanh toán thất bại!');
    // Chuyển hướng về trang thanh toán hoặc trang chủ
    setTimeout(() => {
      this.router.navigate(['/checkout']);
    }, 3000);
  }
}