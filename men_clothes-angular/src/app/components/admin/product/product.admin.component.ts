import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductVariantService } from 'src/app/services/product.variant.service';
import { Category } from 'src/app/models/category';
import { environment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-product-admin',
  templateUrl: './product.admin.component.html',
  styleUrls: [
    './product.admin.component.scss',        
  ]
})
export class ProductAdminComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: number = 0;
  selectedCategoryName: string = 'Tất cả';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 0;
  totalProducts: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  productStocks: Map<number, number> = new Map(); // Lưu số lượng tồn kho
  
  // Dùng cho modal xác nhận xóa
  showDeleteModal: boolean = false;
  productToDelete: Product | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private productVariantService: ProductVariantService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  /**
   * Tải danh sách danh mục sản phẩm
   */
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Lỗi khi tải danh mục:', error);
      }
    });
  }

  /**
   * Lấy danh sách sản phẩm
   */
  getProducts(keyword: string, categoryId: number, page: number, limit: number) {
    this.productService.getProducts(keyword, categoryId, page, limit).subscribe({
      next: (response: any) => {
        this.products = response.products;
        this.totalPages = response.totalPages;
        this.totalProducts = response.totalItems || this.products.length;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        
        // Cập nhật tên danh mục được chọn
        if (this.selectedCategoryId > 0) {
          const selectedCategory = this.categories.find(c => c.id === +this.selectedCategoryId);
          this.selectedCategoryName = selectedCategory ? selectedCategory.name : 'Không xác định';
        } else {
          this.selectedCategoryName = 'Tất cả';
        }
        
        // Lấy thông tin tồn kho cho từng sản phẩm
        this.loadProductStocks();
        
        // Thêm URL hình ảnh đầy đủ cho sản phẩm
        this.products.forEach(product => {
          if (product.thumbnail) {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          }
          
          // Nếu sản phẩm có danh mục, lấy tên danh mục
          if (product.category_id) {
            const category = this.categories.find(c => c.id === product.category_id);
            product.categoryName = category ? category.name : 'Chưa phân loại';
          }
        });
      },
      error: (error: any) => {
        console.error('Lỗi khi tải sản phẩm:', error);
      }
    });    
  }
  
  /**
   * Tìm kiếm sản phẩm dựa trên từ khóa
   */
  searchProducts(): void {
    this.currentPage = 1;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }
  
  /**
   * Lọc sản phẩm theo danh mục
   */
  filterByCategory(): void {
    this.currentPage = 1;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  /**
   * Lấy thông tin số lượng tồn kho cho các sản phẩm
   */
  loadProductStocks(): void {
    this.products.forEach(product => {
      this.productVariantService.getProductVariants(product.id).subscribe({
        next: (variants: any[]) => {
          // Tính tổng số lượng tồn kho từ tất cả biến thể
          const totalStock = variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
          this.productStocks.set(product.id, totalStock);
        },
        error: (error) => {
          console.error(`Lỗi khi lấy thông tin tồn kho cho sản phẩm ${product.id}:`, error);
        }
      });
    });
  }
  
  /**
   * Lấy số lượng tồn kho của sản phẩm
   */
  getProductStock(productId: number): number | null {
    return this.productStocks.get(productId) || null;
  }

  /**
   * Chuyển trang
   */
  onPageChange(page: number) {
    this.currentPage = page;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  /**
   * Tạo mảng trang hiển thị
   */
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  /**
   * Hiển thị modal xác nhận xóa sản phẩm
   */
  showDeleteConfirm(product: Product): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  /**
   * Hủy xóa sản phẩm
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  /**
   * Xác nhận xóa sản phẩm
   */
  confirmDelete(): void {
    if (this.productToDelete) {
      this.deleteProduct(this.productToDelete.id);
      this.showDeleteModal = false;
      this.productToDelete = null;
    }
  }

  /**
   * Xóa sản phẩm
   */
  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // Cập nhật lại danh sách sản phẩm
        this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
        // Hiển thị thông báo thành công
        this.showNotification('Xóa sản phẩm thành công!', 'success');
      },
      error: (error: any) => {
        console.error('Lỗi khi xóa sản phẩm:', error);
        this.showNotification('Có lỗi xảy ra khi xóa sản phẩm.', 'error');
      }
    });    
  }

  /**
   * Xem chi tiết sản phẩm
   */
  viewDetails(id: number) {
    this.router.navigate(['/admin/products', id]);
  }
  
  /**
   * Xử lý các tùy chọn
   */
  handleOptionClick(index: number): void {
    if (index === 0) {
      // Thêm sản phẩm mới
      this.router.navigate(['admin/add-product']);                      
    }
    else if (index === 1) {
      // Quản lý màu, kích cỡ
      // Tạm thời chỉ hiển thị thông báo
      this.showNotification('Tính năng đang phát triển.', 'info');
    }
  }

  /**
   * Hiển thị thông báo
   * Trong thực tế, bạn có thể sử dụng một thư viện toast như ngx-toastr
   */
  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Đây chỉ là giả lập, trong ứng dụng thực tế bạn sẽ dùng một component toast
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // Để tích hợp với thư viện toast, bạn sẽ sử dụng code như:
    // this.toastr.success(message); hoặc this.toastr.error(message);
    
    // Giả lập thông báo cho người dùng
    alert(`${message}`);
  }
}