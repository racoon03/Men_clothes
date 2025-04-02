import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { ProductService } from './product.service';
import { Observable, of } from 'rxjs';
import { CartItem } from '../models/cart.item';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private cart: Map<number, { quantity: number, color_id?: number, size_id?: number }> = new Map(); // Dùng Map để lưu trữ giỏ hàng, key là id sản phẩm, value là số lượng

  constructor(private productService: ProductService) {
    // Lấy dữ liệu giỏ hàng từ localStorage khi khởi tạo service    
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart = new Map(JSON.parse(storedCart));      
    }
  }

  addToCart(productId: number, color_id: number, size_id: number, quantity: number = 1): void {
    debugger
    if (this.cart.has(productId)) {
      // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
      const currentItem = this.cart.get(productId)!;
      currentItem.quantity += quantity;
      // Cập nhật color_id và size_id nếu được cung cấp
      if (color_id !== undefined) currentItem.color_id = color_id;
      if (size_id !== undefined) currentItem.size_id = size_id;
      this.cart.set(productId, currentItem);
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm sản phẩm vào với số lượng là `quantity`
      this.cart.set(productId, { color_id, size_id, quantity });
    }
     // Sau khi thay đổi giỏ hàng, lưu trữ nó vào localStorage
    this.saveCartToLocalStorage();
  }
  
  getCart(): Map<number, { quantity: number, color_id?: number, size_id?: number }> {
    return this.cart;
  }
  // Lưu trữ giỏ hàng vào localStorage
  private saveCartToLocalStorage(): void {
    debugger
    localStorage.setItem('cart', JSON.stringify(Array.from(this.cart.entries())));
  }  
  // Hàm xóa dữ liệu giỏ hàng và cập nhật Local Storage
  clearCart(): void {
    this.cart.clear(); // Xóa toàn bộ dữ liệu trong giỏ hàng
    this.saveCartToLocalStorage(); // Lưu giỏ hàng mới vào Local Storage (trống)
  }

  /**
   * Lấy danh sách sản phẩm trong giỏ hàng với đầy đủ thông tin
   */
  getCartItems(): Observable<CartItem[]> {
    const cart = this.getCart();
    const productIds = Array.from(cart.keys());

    if (productIds.length === 0) {
      return of([]);
    }

    return new Observable<CartItem[]>(observer => {
      this.productService.getProductsByIds(productIds).subscribe({
        next: (products) => {
          const cartItems = productIds.map((productId) => {
            const product = products.find((p) => p.id === productId);
            
            if (product) {
              product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
            }
            
            const cartItem = cart.get(productId)!;
            
            return {
              product: product!,
              quantity: cartItem.quantity,
              color_id: cartItem.color_id,
              size_id: cartItem.size_id,
              selected: true // Mặc định chọn tất cả sản phẩm
            };
          });
          
          observer.next(cartItems);
          observer.complete();
        },
        error: (error) => {
          console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  updateQuantity(productId: number, quantity: number): void {
    if (this.cart.has(productId)) {
      const item = this.cart.get(productId)!;
      item.quantity = quantity;
      this.cart.set(productId, item);
      this.saveCartToLocalStorage();
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeItem(productId: number): void {
    this.cart.delete(productId);
    this.saveCartToLocalStorage();
  }

  /**
   * Xóa nhiều sản phẩm khỏi giỏ hàng
   */
  removeItems(productIds: number[]): void {
    productIds.forEach(id => {
      this.cart.delete(id);
    });
    this.saveCartToLocalStorage();
  }

  /**
   * Tính tổng tiền hàng trong giỏ
   */
  calculateSubtotal(selectedItems: CartItem[]): number {
    return selectedItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  /**
   * Đếm số lượng sản phẩm trong giỏ hàng
   */
  getCartItemCount(): number {
    return this.cart.size;
  }

  /**
   * Kiểm tra giỏ hàng có trống không
   */
  isCartEmpty(): boolean {
    return this.cart.size === 0;
  }
  
}
