
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
import { COLOR_MAPPING } from '../color/color.mapping';
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../models/comment';
import { CommentDTO } from '../../dtos/comment.dto';
import { TokenService } from '../../services/token.service';
import { UserService } from 'src/app/services/user.service';
//import { AuthService } from '../../services/';

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
  productVariants: any[] = [];
  selectedColorId: number = 0;
  selectedSizeId: number = 0;
  availableColors: any[] = [];
  availableSizes: any[] = [];
  isLoading: boolean = true;

  // Thêm vào phần properties của class
comments: Comment[] = [];
isLoadingComments: boolean = false;
isLoggedIn: boolean = false;
currentUser: any = null;
newComment: CommentDTO = {
  content: '',
  product_id: 0,
  user_id: 0
};
  
  // Biến để lưu các kích thước có sẵn theo màu
  availableSizesByColor: Map<number, number[]> = new Map();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productVariantService: ProductVariantService,
    private commentService: CommentService,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    // Lấy ID sản phẩm từ URL
    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    
    if (idParam !== null) {
      this.productId = +idParam;
      this.loadProductDetails();
      this.isLoggedIn = this.userService.isUserLoggedIn();

      // Tải comments
      this.loadComments();
      
    } else {
      console.error('Không tìm thấy ID sản phẩm trong URL');
      this.router.navigate(['/products']);
    }
  }

  // Tải bình luận của sản phẩm
  loadComments(): void {
    if (!this.productId) return;
    
    this.isLoadingComments = true;
    this.commentService.getCommentsByProduct(this.productId).subscribe({
      next: (response) => {
        this.comments = response;
        console.log('comment :', this.comments);
        this.isLoadingComments = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải bình luận:', error);
        this.isLoadingComments = false;
      }
    });
  }

  // Đăng bình luận mới
  postComment(): void {
    // if (this.userService.isUserLoggedIn()) {
    //   alert('Vui lòng đăng nhập để bình luận.');
    //   return;
    // }
    this.newComment.product_id = this.productId;
    this.newComment.user_id = this.tokenService.getUserId();
    
    if (!this.newComment.content.trim()) {
      alert('Vui lòng nhập nội dung bình luận.');
      return;
    }
    
    this.commentService.addComment(this.newComment).subscribe({
      next: () => {
        // Sau khi đăng bình luận thành công, tải lại danh sách bình luận
        this.loadComments();
        // Reset form
        this.newComment.content = '';
        alert('Đăng bình luận thành công!');
      },
      error: (error) => {
        console.error('Lỗi khi đăng bình luận:', error);
        alert('Có lỗi xảy ra khi đăng bình luận. Vui lòng thử lại sau.');
      }
    });
  }

  // Thêm vào class DetailProductComponent
  formatDate(dateArray: any[]): string {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6) {
      return '';
    }
    
    const [year, month, day, hour, minute] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute);
    
    return `${day}/${month}/${year} ${hour}:${minute < 10 ? '0' + minute : minute}`;
  }

  // Tải thông tin chi tiết sản phẩm
  loadProductDetails(): void {
    this.isLoading = true;
    
    if (!isNaN(this.productId)) {
      this.productService.getDetailProduct(this.productId).subscribe({
        next: (response: any) => {
          // Xử lý ảnh sản phẩm
          if (response.product_images && response.product_images.length > 0) {
            response.product_images.forEach((product_image: ProductImage) => {
              product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
            });
          }
          
          this.product = response;
          this.showImage(0);
          
          // Tải thông tin biến thể sản phẩm
          this.loadProductVariants();
        },
        error: (error: any) => {
          console.error('Lỗi khi tải thông tin sản phẩm:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.error('ID sản phẩm không hợp lệ');
      this.isLoading = false;
      this.router.navigate(['/products']);
    }
  }
  
  // Tải các biến thể của sản phẩm (màu sắc, kích thước)
  loadProductVariants(): void {
    if (this.productId) {
      this.productVariantService.getProductVariants(this.productId).subscribe({
        next: (variants: any[]) => {
          this.productVariants = variants;
          this.extractAvailableOptions();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi khi tải biến thể sản phẩm:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  // Trích xuất các tùy chọn có sẵn (màu sắc, kích thước)
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
    
    // Tạo bản đồ kích thước theo màu
    this.availableSizesByColor = new Map();
    this.productVariants.forEach(variant => {
      if (!this.availableSizesByColor.has(variant.color.id)) {
        this.availableSizesByColor.set(variant.color.id, []);
      }
      this.availableSizesByColor.get(variant.color.id)?.push(variant.size.id);
    });
    
    // Mặc định chọn giá trị đầu tiên nếu có
    if (this.availableColors.length > 0) {
      this.selectedColorId = this.availableColors[0].id;
    }
    
    // Chọn kích thước đầu tiên có sẵn cho màu đã chọn
    this.updateAvailableSizes();
  }

  // Hàm xử lý khi người dùng chọn màu
  onColorSelect(colorId: number): void {
    this.selectedColorId = colorId;
    this.updateAvailableSizes();
  }

    // Phương thức để lấy mã màu dựa trên ID
  getColorCode(colorId: number): string {
    return COLOR_MAPPING[colorId] || '#000000';
  }
  
  // Cập nhật kích thước có sẵn dựa trên màu đã chọn
  updateAvailableSizes(): void {
    // Lấy danh sách ID kích thước có sẵn cho màu đã chọn
    const availableSizeIds = this.availableSizesByColor.get(this.selectedColorId) || [];
    
    // Kiểm tra xem kích thước đã chọn có còn khả dụng không
    if (!availableSizeIds.includes(this.selectedSizeId) && availableSizeIds.length > 0) {
      this.selectedSizeId = availableSizeIds[0];
    }
  }
  
  // Kiểm tra xem kích thước có khả dụng cho màu đã chọn không
  isSizeAvailable(sizeId: number): boolean {
    const availableSizeIds = this.availableSizesByColor.get(this.selectedColorId) || [];
    return availableSizeIds.includes(sizeId);
  }

  // Xử lý khi người dùng chọn kích thước
  onSizeSelect(sizeId: number): void {
    this.selectedSizeId = sizeId;
  }

  // Hiển thị ảnh theo index
  showImage(index: number): void {
    if (this.product && this.product.product_images && 
        this.product.product_images.length > 0) {
      // Đảm bảo index nằm trong khoảng hợp lệ        
      if (index < 0) {
        index = 0;
      } else if (index >= this.product.product_images.length) {
        index = this.product.product_images.length - 1;
      }        
      // Gán index hiện tại
      this.currentImageIndex = index;
    }
  }
  
  // Xử lý khi click vào thumbnail
  thumbnailClick(index: number) {
    this.currentImageIndex = index;
  }  
  
  // Chuyển đến ảnh tiếp theo
  nextImage(): void {
    this.showImage(this.currentImageIndex + 1);
  }

  // Quay lại ảnh trước
  previousImage(): void {
    this.showImage(this.currentImageIndex - 1);
  }
  
  // Thêm sản phẩm vào giỏ hàng
  addToCart(): void {
    if (!this.userService.isUserLoggedIn()) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      this.router.navigate(['/login']);
      return;
    }
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.selectedColorId, this.selectedSizeId, this.quantity);
      alert('Đã thêm sản phẩm vào giỏ hàng.');
    } else {
      console.error('Không thể thêm sản phẩm vào giỏ hàng vì product là null.');
    }
  }    
      
  // Tăng số lượng sản phẩm
  increaseQuantity(): void {
    this.quantity++;
  }
  
  // Giảm số lượng sản phẩm
  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  // Chuyển hướng đến trang đặt hàng
  buyNow(): void {
    if (!this.userService.isUserLoggedIn()) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      this.router.navigate(['/login']);
      return;
    }
    if (this.product) {
      this.cartService.addToCart(this.product.id, this.selectedColorId, this.selectedSizeId, this.quantity);
      this.router.navigate(['/orders']);
    }
  }
}
