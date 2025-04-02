import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { ProductService } from 'src/app/services/product.service';
import { CategoryService } from '../../services/category.service';
import { environment } from '../../enviroments/enviroment';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 9;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  
  // Biến cho banner carousel
  currentBannerIndex: number = 0;
  bannerInterval: Subscription | null = null;

  // Danh sách sản phẩm theo danh mục
  tShirtProducts: Product[] = []; // Áo phông (id: 3)
  varsityProducts: Product[] = []; // Varsity (id: 4)
  trouserProducts: Product[] = []; // Quần tây (id: 2)

  // Vị trí hiển thị của sản phẩm trong mỗi danh mục (0: 5 sản phẩm đầu, 1: 5 sản phẩm tiếp theo)
  tShirtPage: number = 0;
  varsityPage: number = 0;
  trouserPage: number = 0;

  // Số lượng sản phẩm hiển thị trong mỗi trang
  itemsPerRow: number = 5;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
    this.getCategories(1, 10);
    this.startBannerAutoSlide();
    
    // Tải sản phẩm theo danh mục
    this.getCategoryProducts(3); // Áo phông
    this.getCategoryProducts(4); // Varsity
    this.getCategoryProducts(2); // Quần tây
  }

  ngOnDestroy(): void {
    if (this.bannerInterval) {
      this.bannerInterval.unsubscribe();
    }
  }

  getCategories(page: number, limit: number): void {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  // Tải sản phẩm cho một danh mục cụ thể
  getCategoryProducts(categoryId: number): void {
    this.productService.getProducts('', categoryId, 1, 10).subscribe({
      next: (response: any) => {
        const products = response.products;
        
        // Xử lý sản phẩm
        products.forEach((product: Product) => {
          // Set product URL
          product.url = `${environment.apiBaseUrl}/products/images/${
            product.thumbnail === null ? "notfounds.jpg" : product.thumbnail
          }`;
          
          // Thêm các thuộc tính mở rộng cho giao diện
          this.enhanceProductData(product);
        });

        // Phân loại sản phẩm vào danh mục tương ứng
        if (categoryId === 3) {
          this.tShirtProducts = products;
        } else if (categoryId === 4) {
          this.varsityProducts = products;
        } else if (categoryId === 2) {
          this.trouserProducts = products;
        }
      },
      error: (error: any) => {
        console.error(`Error fetching products for category ${categoryId}:`, error);
      }
    });
  }

  searchProducts(): void {
    this.currentPage = 1;
    this.itemsPerPage = 9;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  getProducts(keyword: string, selectedCategoryId: number, page: number, limit: number): void {
    this.productService.getProducts(keyword, selectedCategoryId, page, limit).subscribe({
      next: (response: any) => {
        response.products.forEach((product: Product) => {
          // Set product URL
          product.url = `${environment.apiBaseUrl}/products/images/${
            product.thumbnail === null ? "notfounds.jpg" : product.thumbnail
          }`;
          
          // Thêm các thuộc tính mở rộng cho giao diện
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

  // Bổ sung thêm thuộc tính cho product để hiển thị trên UI
  enhanceProductData(product: Product): void {
    // Luôn hiển thị badge quà tặng
    product.hasGift = true;
    
    // Luôn hiển thị giảm giá
    product.discount = 25; // Giảm giá 25%
    product.originalPrice = Math.round(product.price * 100 / 75); // Tính ngược giá gốc
    
    
    // Gán đánh giá sao cố định
    product.rating = 4 + Math.random(); // 4.0-5.0
    product.rating = Math.round(product.rating * 10) / 10; // Làm tròn 1 chữ số thập phân
    product.ratingCount = 5 + Math.floor(Math.random() * 30); // 5-35
    
    // Đặt vị trí index cho mỗi sản phẩm - để hiển thị đa dạng
    const index = this.products.length;
    
    // Thay đổi giá trị theo index để có sự đa dạng
    if (index % 3 === 0) {
      product.discount = 30;
      product.rating = 5.0;
    } else if (index % 3 === 1) {
      product.discount = 15;
      product.rating = 4.0;
    }
    
    // Một số sản phẩm không có gift
    product.hasGift = index % 4 !== 3;
    
    // Tìm categoryName từ categories nếu có thể
    if (product.category_id && this.categories.length > 0) {
      const category = this.categories.find(c => c.id === product.category_id);
      product.categoryName = category ? category.name : '';
    }
  }

  onPageChange(page: number): void {
    if (this.currentPage !== page) {
      this.currentPage = page;
      this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
      
      // Scroll lên đầu danh sách sản phẩm
      const element = document.querySelector('.products-section');
      window.scrollTo({
        top: element instanceof HTMLElement ? element.offsetTop : 0,
        behavior: 'smooth'
      });
    }
  }

  // Lấy sản phẩm hiển thị cho danh mục và trang hiện tại
  getVisibleProducts(products: Product[], page: number): Product[] {
    const startIndex = page * this.itemsPerRow;
    return products.slice(startIndex, startIndex + this.itemsPerRow);
  }

  // Chuyển trang cho danh mục cụ thể
  changeProductPage(category: string): void {
    if (category === 'tshirt') {
      this.tShirtPage = (this.tShirtPage === 0) ? 1 : 0;
    } else if (category === 'varsity') {
      this.varsityPage = (this.varsityPage === 0) ? 1 : 0;
    } else if (category === 'trouser') {
      this.trouserPage = (this.trouserPage === 0) ? 1 : 0;
    }
  }

  // Dùng cho category click
  onCategoryClick(categoryId: number): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.router.navigate(['/home/', categoryId]);
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

  onProductClick(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  // Banner slide functions
  prevBanner(): void {
    this.currentBannerIndex = this.currentBannerIndex === 0 ? 1 : 0;
    this.resetBannerInterval();
  }

  nextBanner(): void {
    this.currentBannerIndex = this.currentBannerIndex === 0 ? 1 : 0;
    this.resetBannerInterval();
  }

  setBannerIndex(index: number): void {
    this.currentBannerIndex = index;
    this.resetBannerInterval();
  }

  startBannerAutoSlide(): void {
    this.bannerInterval = interval(5000).subscribe(() => {
      this.nextBanner();
    });
  }

  resetBannerInterval(): void {
    if (this.bannerInterval) {
      this.bannerInterval.unsubscribe();
    }
    this.startBannerAutoSlide();
  }
}