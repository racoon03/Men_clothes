import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { TokenService } from '../../services/token.service';
import { UserService } from '../../services/user.service';
import { PaymentService } from '../../services/payment.service';
import { ColorService } from '../../services/color.service';
import { SizeService } from '../../services/size.service';

import { environment } from '../../enviroments/enviroment';
import { OrderDTO } from '../../dtos/order/order.dto';
import { Color } from '../../models/color';
import { Size } from '../../models/size';
import { ApiResponse } from '../responses/api.responses';
import { CartItem } from '../../models/cart.item';
import { UserResponse } from '../responses/user/user.response';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  cartItems: CartItem[] = [];
  
  colors: Color[] = [];
  sizes: Size[] = [];
  
  couponCode: string = '';
  couponDiscount: number = 0;
  totalAmount: number = 0;
  
  // Selection tracking
  allItemsSelected: boolean = true;
  selectedItemsCount: number = 0;
  
  // User data
  userData: UserResponse | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private userService: UserService,
    private colorService: ColorService,
    private sizeService: SizeService,
    private paymentService: PaymentService,
    private tokenService: TokenService,
    private fb: FormBuilder,
    private router: Router
  ) {
    // Khởi tạo form với validators
    this.orderForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.minLength(6)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      note: [''],
      shipping_method: ['express'],
      payment_method: ['cod']
    });
  }

  ngOnInit(): void {
    // Lấy thông tin người dùng từ service
    this.userData = this.userService.getUserResponseFromLocalStorage();
    
    // Điền thông tin người dùng vào form
    if (this.userData) {
      this.userService.fillUserInfoToForm(this.orderForm);
    }
    
    // Tải dữ liệu màu sắc và kích thước
    this.loadColors();
    this.loadSizes();
    
    // Tải dữ liệu giỏ hàng
    this.loadCartItems();
  }
  
  /**
   * Tải dữ liệu sản phẩm trong giỏ hàng
   */
  loadCartItems(): void {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.updateSelection();
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu giỏ hàng:', error);
      }
    });
  }
  
  /**
   * Tải dữ liệu màu sắc
   */
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
  
  /**
   * Tải dữ liệu kích thước
   */
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
  
  /**
   * Lấy tên màu sắc dựa trên ID
   */
  getColorName(colorId?: number): string {
    if (!colorId) return 'N/A';
    const color = this.colors.find(c => c.id === colorId);
    return color ? color.name : 'N/A';
  }
  
  /**
   * Lấy tên kích thước dựa trên ID
   */
  getSizeName(sizeId?: number): string {
    if (!sizeId) return 'N/A';
    const size = this.sizes.find(s => s.id === sizeId);
    return size ? size.name : 'N/A';
  }
  
  /**
   * Chọn/bỏ chọn tất cả sản phẩm
   */
  toggleSelectAll(): void {
    this.allItemsSelected = !this.allItemsSelected;
    this.cartItems.forEach(item => {
      item.selected = this.allItemsSelected;
    });
    this.updateSelection();
  }
  
  /**
   * Cập nhật thông tin về số lượng sản phẩm đã chọn
   */
  updateSelection(): void {
    this.selectedItemsCount = this.cartItems.filter(item => item.selected).length;
    this.allItemsSelected = this.selectedItemsCount === this.cartItems.length && this.cartItems.length > 0;
    this.calculateTotal();
  }
  
  /**
   * Cập nhật số lượng sản phẩm
   */
  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;
    
    // Cập nhật số lượng trong giao diện
    item.quantity = newQuantity;
    
    // Cập nhật số lượng trong giỏ hàng và localStorage thông qua service
    this.cartService.updateQuantity(item.product.id, newQuantity);
    
    // Cập nhật tổng tiền
    this.calculateTotal();
  }
  
  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeItem(item: CartItem): void {
    // Xóa khỏi giao diện
    this.cartItems = this.cartItems.filter(cartItem => cartItem.product.id !== item.product.id);
    
    // Xóa khỏi giỏ hàng và localStorage thông qua service
    this.cartService.removeItem(item.product.id);
    
    // Cập nhật trạng thái chọn
    this.updateSelection();
  }
  
  /**
   * Tính tổng tiền hàng (chưa bao gồm phí vận chuyển)
   */
  calculateSubtotal(): number {
    const selectedItems = this.cartItems.filter(item => item.selected);
    return this.cartService.calculateSubtotal(selectedItems);
  }
  
  /**
   * Lấy giá trị phí vận chuyển nhanh
   */
  get expressShippingCost(): number {
    return this.orderService.getExpressShippingCost();
  }
  
  /**
   * Lấy giá trị phí vận chuyển tiêu chuẩn
   */
  get normalShippingCost(): number {
    return this.orderService.getNormalShippingCost();
  }
  
  /**
   * Tính phí vận chuyển dựa trên phương thức vận chuyển đã chọn
   */
  calculateShippingCost(): number {
    const shippingMethod = this.orderForm.get('shipping_method')?.value;
    return this.orderService.calculateShippingCost(shippingMethod);
  }
  
  /**
   * Tính tổng tiền thanh toán
   */
  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const shippingCost = this.calculateShippingCost();
    this.totalAmount = this.orderService.calculateTotal(subtotal, shippingCost, this.couponDiscount);
    return this.totalAmount;
  }
  
  /**
   * Áp dụng mã giảm giá
   */
  applyCoupon(): void {
    if (!this.couponCode) {
      alert('Vui lòng nhập mã giảm giá');
      return;
    }
    
    // Gọi service để áp dụng mã giảm giá
    const subtotal = this.calculateSubtotal();
    const discount = this.orderService.applyCoupon(this.couponCode, subtotal);
    
    if (discount > 0) {
      this.couponDiscount = discount;
      alert('Áp dụng mã giảm giá thành công!');
    } else {
      this.couponDiscount = 0;
      alert('Mã giảm giá không hợp lệ!');
      this.couponCode = '';
    }
    
    // Cập nhật tổng tiền
    this.calculateTotal();
  }
  
  /**
   * Kiểm tra trường form có lỗi không
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
  
  /**
   * Lấy thông báo lỗi cho trường
   */
  getFieldErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (!field) return '';
    
    if (field.hasError('required')) {
      return `${fieldName} là trường bắt buộc.`;
    }
    
    if (field.hasError('email')) {
      return 'Email không hợp lệ.';
    }
    
    if (field.hasError('minlength')) {
      return `${fieldName} phải có ít nhất ${field.errors?.['minlength'].requiredLength} ký tự.`;
    }
    
    return 'Trường không hợp lệ.';
  }
  
  /**
   * Đặt hàng
   */
  placeOrder(): void {
    if (!this.orderForm.valid) {
      alert('Vui lòng điền đầy đủ thông tin cần thiết');
      this.orderForm.markAllAsTouched();
      return;
    }
    
    // Lấy danh sách sản phẩm đã chọn
    const selectedItems = this.cartItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để đặt hàng');
      return;
    }
    
    // Chuẩn bị dữ liệu đơn hàng
    const orderData = this.orderService.prepareOrderData(
      this.orderForm.value,
      this.userData,
      selectedItems,
      this.calculateTotal(),
      this.couponCode
    );
    
    // Kiểm tra phương thức thanh toán
    if (orderData.payment_method === 'vnpay') {
      this.processVNPayPayment(orderData);
    } else {
      this.processCODPayment(orderData);
    }
  }
  
  /**
   * Xử lý thanh toán qua VNPay
   */
  private processVNPayPayment(orderData: OrderDTO): void {
    const amount = orderData.total_money || 0;
    
    // Tạo URL thanh toán VNPay
    this.paymentService.createPaymentUrl({ amount, language: 'vn' }).subscribe({
      next: (res: ApiResponse) => {
        const paymentUrl = res.data;
        const vnp_TxnRef = new URL(paymentUrl).searchParams.get('vnp_TxnRef') || '';
        
        // Đặt hàng với mã giao dịch VNPay
        this.orderService.placeOrder({
          ...orderData,
          vnp_txn_ref: vnp_TxnRef
        }).subscribe({
          next: () => {
            // Xóa những sản phẩm đã chọn khỏi giỏ hàng
            this.removeSelectedItemsFromCart();
            
            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = paymentUrl;
          },
          error: (err: HttpErrorResponse) => {
            console.error('Lỗi khi đặt hàng:', err);
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tạo URL thanh toán:', err);
        alert('Có lỗi xảy ra khi kết nối đến cổng thanh toán. Vui lòng thử lại.');
      }
    });
  }
  
  /**
   * Xử lý thanh toán COD
   */
  private processCODPayment(orderData: OrderDTO): void {
    this.orderService.placeOrder(orderData).subscribe({
      next: () => {
        // Xóa những sản phẩm đã chọn khỏi giỏ hàng
        this.removeSelectedItemsFromCart();
        
        alert('Đặt hàng thành công!');
        this.router.navigate(['/']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi đặt hàng:', err);
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
    });
  }
  
  /**
   * Xóa các sản phẩm đã chọn khỏi giỏ hàng
   */
  removeSelectedItemsFromCart(): void {
    // Lấy danh sách ID sản phẩm đã chọn
    const selectedProductIds = this.cartItems
      .filter(item => item.selected)
      .map(item => item.product.id);
    
    // Xóa các sản phẩm đã chọn khỏi giỏ hàng qua service
    this.cartService.removeItems(selectedProductIds);
    
    // Cập nhật danh sách sản phẩm trong giao diện
    this.cartItems = this.cartItems.filter(item => !item.selected);
    this.updateSelection();
  }

  gohome(): void {
    this.router.navigate(['/']);
  }
}