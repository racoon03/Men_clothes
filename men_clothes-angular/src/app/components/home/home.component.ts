import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../enviroments/enviroment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = []; // Dữ liệu động từ categoryService
  selectedCategoryId: number = 0; // Giá trị category được chọn
  currentPage: number = 1;
  itemsPerPage: number = 12; // Tăng số lượng sản phẩm mỗi trang
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Tải danh mục
    this.getCategories(1, 20);
    
    // Lấy category ID từ URL params
    this.activatedRoute.params.subscribe(params => {
      if (params['id']) {
        // Nếu có ID trong URL
        this.selectedCategoryId = parseInt(params['id'], 10);
      } else {
        // Không có ID, đặt về mặc định
        this.selectedCategoryId = 0;
      }
      
      // Tải sản phẩm với ID từ URL
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    });
  }
  
  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

    // Dùng cho category click
  onCategoryClick(categoryId: number) {
    // Navigate to the same component but with category ID in the URL
    this.router.navigate(['/home', categoryId]);
  }

  // Method to get category name by ID
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  }
  
  searchProducts() {
    this.currentPage = 1;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }
  
  getProducts(keyword: string, selectedCategoryId: number, page: number, limit: number) {
    this.productService.getProducts(keyword, selectedCategoryId, page, limit).subscribe({
      next: (response: any) => {
        response.products.forEach((product: Product) => {
          // Set product URL
          product.url = `${environment.apiBaseUrl}/products/images/${
            product.thumbnail === null ? "notfounds.jpg" : product.thumbnail
          }`;
          
          // Thêm thuộc tính để hiển thị card
          this.enhanceProductData(product);
        });
        
        this.products = response.products;
        this.totalPages = response.totalPages;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
      },
      error: (error: any) => {
        console.error('Error fetching products:', error);
      }
    });
  }
  
  enhanceProductData(product: Product) {
    // Thêm đánh giá sao
    product.rating = 5;
    product.ratingCount = Math.floor(Math.random() * 40) + 5; // 5-45 đánh giá
    
    // Thêm giảm giá (30% cho tất cả)
    product.discount = 30;
    product.originalPrice = Math.round(product.price * 100 / 70);
  }
  
  onPageChange(page: number) {
    if (this.currentPage !== page) {
      this.currentPage = page;
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
      
      // Cuộn lên đầu trang
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1).fill(0).map((_, index) => startPage + index);
  }
  
  onProductClick(productId: number) {
    this.router.navigate(['/products', productId]);
  }
}