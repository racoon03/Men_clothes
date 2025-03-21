import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { environment } from '../../enviroments/enviroment';
import { OrderDTO } from '../../dtos/order/order.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { Color } from '../../models/color';
import { Size } from '../../models/size';
import { ColorService } from '../../services/color.service';
import { SizeService } from '../../services/size.service';
import { ApiResponse } from '../responses/api.responses';
import { HttpErrorResponse } from '@angular/common/http';
import { PaymentService } from '../../services/payment.service';



@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  orderForm: FormGroup; // Đối tượng FormGroup để quản lý dữ liệu của form
  cartItems: { product: Product, quantity: number, color_id?: number, size_id?: number }[] = [];
  couponCode: string = ''; // Mã giảm giá
  totalAmount: number = 0; // Tổng tiền
  colors: Color[] = [];
  sizes: Size[] = [];

  orderData: OrderDTO = {
    user_id: 9, // Thay bằng user_id thích hợp
    fullname: '', // Khởi tạo rỗng, sẽ được điền từ form
    email: '', // Khởi tạo rỗng, sẽ được điền từ form
    phone_number: '', // Khởi tạo rỗng, sẽ được điền từ form
    address: '', // Khởi tạo rỗng, sẽ được điền từ form
    note: '', // Có thể thêm trường ghi chú nếu cần
    total_money: 0, // Sẽ được tính toán dựa trên giỏ hàng và mã giảm giá
    payment_method: 'vnpay', // Mặc định là thanh toán khi nhận hàng (COD)
    shipping_method: 'express', // Mặc định là vận chuyển nhanh (Express)
    coupon_code: '', // Sẽ được điền từ form khi áp dụng mã giảm giá
    cart_items: [],
  };

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private tokenService: TokenService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private colorService: ColorService, 
    private sizeService: SizeService, 
    private paymentService: PaymentService
  ) {
    // Tạo FormGroup và các FormControl tương ứng
    this.orderForm = this.fb.group({
      fullname: ['hoàng xx', Validators.required], // fullname là FormControl bắt buộc      
      email: ['hoang234@gmail.com', [Validators.email]], // Sử dụng Validators.email cho kiểm tra định dạng email
      phone_number: ['11445547', [Validators.required, Validators.minLength(6)]], // phone_number bắt buộc và ít nhất 6 ký tự
      address: ['nhà x ngõ y', [Validators.required, Validators.minLength(5)]], // address bắt buộc và ít nhất 5 ký tự
      note: ['dễ vo'],
      shipping_method: ['express'],
      payment_method: ['vnpay']
    });
  }
  

  ngOnInit(): void {  
    //this.cartService.clearCart();
    // Lấy danh sách sản phẩm từ giỏ hàng
    this.orderData.user_id = this.tokenService.getUserId();    
    debugger
    const cart = this.cartService.getCart();
    // Tải dữ liệu màu sắc và kích thước từ API
    this.loadColors();
    this.loadSizes();
    const productIds = Array.from(cart.keys()); // Chuyển danh sách ID từ Map giỏ hàng    

    // Gọi service để lấy thông tin sản phẩm dựa trên danh sách ID
    debugger
    if(productIds.length === 0) {
      return;
    }
    this.productService.getProductsByIds(productIds).subscribe({
      next: (products) => {            
        debugger
        // Lấy thông tin sản phẩm và số lượng từ danh sách sản phẩm và giỏ hàng
        this.cartItems = productIds.map((productId) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
          product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
        }
        
          const cartItem = cart.get(productId)!; // Lấy dữ liệu từ giỏ hàng
        
        return {
          product: product!,
          quantity: cartItem.quantity, // Trích xuất quantity từ đối tượng
          color_id: cartItem.color_id, // Trích xuất color_id từ đối tượng
          size_id: cartItem.size_id    // Trích xuất size_id từ đối tượng
        };
      });
        console.log('haha');
        console.log(this.cartItems);
      },
      complete: () => {
        debugger;
        this.calculateTotal()
      },
      error: (error: any) => {
        debugger;
        console.error('Error fetching detail:', error);
      }
    });        
  }
  placeOrder() {
    debugger
    if (this.orderForm.valid) {
      // Gán giá trị từ form vào đối tượng orderData
      /*
      this.orderData.fullname = this.orderForm.get('fullname')!.value;
      this.orderData.email = this.orderForm.get('email')!.value;
      this.orderData.phone_number = this.orderForm.get('phone_number')!.value;
      this.orderData.address = this.orderForm.get('address')!.value;
      this.orderData.note = this.orderForm.get('note')!.value;
      this.orderData.shipping_method = this.orderForm.get('shipping_method')!.value;
      this.orderData.payment_method = this.orderForm.get('payment_method')!.value;
      */
      
      // Đảm bảo total_money được thiết lập trước khi gửi đơn hàng
      this.orderData.total_money = this.totalAmount;
      // Sử dụng toán tử spread (...) để sao chép giá trị từ form vào orderData
      this.orderData = {
        ...this.orderData,
        ...this.orderForm.value
      };
      this.orderData.cart_items = this.cartItems.map(cartItem => ({
        product_id: cartItem.product.id,
        quantity: cartItem.quantity,
        color_id: cartItem.color_id, // Bạn cần đảm bảo cartItem có thuộc tính này
        size_id: cartItem.size_id
      }));

      // Kiểm tra: Nếu payment_method = 'vnpay' => Gọi createPaymentUrl, 
      // ngược lại => placeOrder
      if (this.orderData.payment_method === 'vnpay') {
        debugger
        const amount = this.orderData.total_money || 0;
      
        // Bước 1: Gọi API tạo link thanh toán
        this.paymentService.createPaymentUrl({ amount, language: 'vn' })
          .subscribe({
            next: (res: ApiResponse) => {
              // res.data là URL thanh toán, ví dụ:
              // https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=49800&...&vnp_TxnRef=18425732&...
              const paymentUrl = res.data;
              console.log('URL thanh toán:', paymentUrl);
              // Bước 2: Tách vnp_TxnRef từ URL vừa trả về
              const vnp_TxnRef = new URL(paymentUrl).searchParams.get('vnp_TxnRef') || '';
      
              // Bước 3: Gọi placeOrder kèm theo vnp_TxnRef
              this.orderService.placeOrder({
                ...this.orderData,
                vnp_txn_ref: vnp_TxnRef
              }).subscribe({
                next: (placeOrderResponse: ApiResponse) => {
                  // Bước 4: Nếu đặt hàng thành công, điều hướng sang trang thanh toán VNPAY
                  debugger
                  window.location.href = paymentUrl;
                },
                error: (err: HttpErrorResponse) => {
                  debugger
                  alert('Lỗi khi đặt hàng');
                }
              });
            },
            error: (err: HttpErrorResponse) => {
              debugger
              alert('Lỗi khi ket noi thanh toán');
            }
          });
      } else { 
          // Dữ liệu hợp lệ, bạn có thể gửi đơn hàng đi
        this.orderService.placeOrder(this.orderData).subscribe({
          next: (response) => {
            debugger;
            alert('Đặt hàng thành công');
            this.cartService.clearCart();
            this.router.navigate(['/']);
          },
          complete: () => {
            debugger;
            this.calculateTotal();
          },
          error: (error: any) => {
            debugger;
            console.error('Lỗi khi đặt hàng:', error);
          },
        });
       }

      
    } else {
      // Hiển thị thông báo lỗi hoặc xử lý khác
      alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
    }        
  }  

  // Thêm phương thức để tải dữ liệu màu sắc
  loadColors(): void {
    this.colorService.getColors().subscribe({
      next: (colors) => {
        this.colors = colors;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu màu sắc:', error);
      }
    });
  }

  // Thêm phương thức để tải dữ liệu kích thước
  loadSizes(): void {
    this.sizeService.getSizes().subscribe({
      next: (sizes) => {
        this.sizes = sizes;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu kích thước:', error);
      }
    });
  }

  // Thêm phương thức để lấy tên màu sắc dựa trên ID
  getColorName(colorId?: number): string {
    if (!colorId) return 'N/A';
    const color = this.colors.find(c => c.id === colorId);
    return color ? color.name : 'N/A';
  }

  // Thêm phương thức để lấy tên kích thước dựa trên ID
  getSizeName(sizeId?: number): string {
    if (!sizeId) return 'N/A';
    const size = this.sizes.find(s => s.id === sizeId);
    return size ? size.name : 'N/A';
  }
  
  // Hàm tính tổng tiền
  calculateTotal(): void {
      this.totalAmount = this.cartItems.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
      );
  }

  // Hàm xử lý việc áp dụng mã giảm giá
  applyCoupon(): void {
      // Viết mã xử lý áp dụng mã giảm giá ở đây
      // Cập nhật giá trị totalAmount dựa trên mã giảm giá nếu áp dụng
  }
}
