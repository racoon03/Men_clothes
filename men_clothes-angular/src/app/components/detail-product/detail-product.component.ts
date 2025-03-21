
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { ProductService } from 'src/app/services/product.service';
import { CartService } from '../../services/cart.service';
import { CategoryService } from 'src/app/services/category.service';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { ProductImage } from 'src/app/models/product.image';
import { environment } from '../../enviroments/enviroment';
import { ProductVariantService } from 'src/app/services/product.variant.service';
@Component({
  selector: 'app-detail-product',
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss']
})
export class DetailProductComponent implements OnInit {
  product?: Product;
  productId: number = 0;
  currentImageIndex: number = 0;
  quantity: number = 1;
  productVariants: any[] = []; // biến này để lưu trữ các biến thể sản phẩm
  selectedColorId: number = 0; // Để theo dõi màu sắc được chọn
  selectedSizeId: number = 0; // Để theo dõi kích thước được chọn
  availableColors: any[] = []; // Các màu sắc có sẵn cho sản phẩm
  availableSizes: any[] = []; // Các kích thước có sẵn cho sản phẩm

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    // private categoryService: CategoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productVariantService: ProductVariantService,
    ) {
      
    }
    ngOnInit() {
      const idParam = this.activatedRoute.snapshot.paramMap.get('id');
      debugger
      if (idParam !== null) {
        this.productId = +idParam;
      }
      if (!isNaN(this.productId)) {
        this.productService.getDetailProduct(this.productId).subscribe({
          next: (response: any) => {            
            // Lấy danh sách ảnh sản phẩm và thay đổi URL
            debugger
            if (response.product_images && response.product_images.length > 0) {
              response.product_images.forEach((product_image:ProductImage) => {
                product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
              });
            }            
            debugger
            this.product = response 
            // Bắt đầu với ảnh đầu tiên
            this.showImage(0);

            // Gọi API lấy thông tin biến thể sản phẩm sau khi đã lấy thông tin sản phẩm
            this.loadProductVariants();
          },
          complete: () => {
            debugger;
          },
          error: (error: any) => {
            debugger;
            console.error('Error fetching detail:', error);
          }
        });    
      } else {
        console.error('Invalid productId:', idParam);
      }  
    }
  
  // Thêm hàm mới để tải biến thể sản phẩm
  loadProductVariants(): void {
    if (this.productId) {
      this.productVariantService.getProductVariants(this.productId).subscribe({
        next: (variants: any[]) => {
          this.productVariants = variants;
            
          // Trích xuất danh sách màu sắc và kích thước có sẵn
          this.extractAvailableOptions();
        },
        error: (error) => {
          console.error('Error loading product variants:', error);
        }
      });
    }
  }
  
    // Hàm để trích xuất các tùy chọn có sẵn (màu sắc, kích thước)
      extractAvailableOptions(): void {
        // Lọc ra các màu sắc duy nhất
        const colorMap = new Map();
        this.productVariants.forEach(variant => {
          if (variant.color && !colorMap.has(variant.color.id)) {
            colorMap.set(variant.color.id, variant.color);
          }
        });
        this.availableColors = Array.from(colorMap.values());
        
        // Lọc ra các kích thước duy nhất
        const sizeMap = new Map();
        this.productVariants.forEach(variant => {
          if (variant.size && !sizeMap.has(variant.size.id)) {
            sizeMap.set(variant.size.id, variant.size);
          }
        });
        this.availableSizes = Array.from(sizeMap.values());
        
        // Mặc định chọn giá trị đầu tiên nếu có
        if (this.availableColors.length > 0) {
          this.selectedColorId = this.availableColors[0].id;
        }
        
        if (this.availableSizes.length > 0) {
          this.selectedSizeId = this.availableSizes[0].id;
        }
      }

      // Hàm xử lý khi người dùng chọn màu
      onColorSelect(colorId: number): void {
        this.selectedColorId = colorId;
      }

      // Hàm xử lý khi người dùng chọn kích thước
      onSizeSelect(sizeId: number): void {
        this.selectedSizeId = sizeId;
      }
  
    showImage(index: number): void {
      debugger
      if (this.product && this.product.product_images && 
          this.product.product_images.length > 0) {
        // Đảm bảo index nằm trong khoảng hợp lệ        
        if (index < 0) {
          index = 0;
        } else if (index >= this.product.product_images.length) {
          index = this.product.product_images.length - 1;
        }        
        // Gán index hiện tại và cập nhật ảnh hiển thị
        this.currentImageIndex = index;
      }
    }
    thumbnailClick(index: number) {
      debugger
      // Gọi khi một thumbnail được bấm
      this.currentImageIndex = index; // Cập nhật currentImageIndex
    }  
    nextImage(): void {
      debugger
      this.showImage(this.currentImageIndex + 1);
    }
  
    previousImage(): void {
      debugger
      this.showImage(this.currentImageIndex - 1);
    }      
    addToCart(): void {
      debugger
      if (this.product) {
        this.cartService.addToCart(this.product.id, this.selectedColorId, this.selectedSizeId, this.quantity);
        alert('Đã thêm sản phẩm vào giỏ hàng.');
      } else {
        // Xử lý khi product là null
        console.error('Không thể thêm sản phẩm vào giỏ hàng vì product là null.');
      }
    }    
        
    increaseQuantity(): void {
      this.quantity++;
    }
    
    decreaseQuantity(): void {
      if (this.quantity > 1) {
        this.quantity--;
      }
    }
    
    buyNow(): void {
      this.router.navigate(['/orders']);
    } 
}
