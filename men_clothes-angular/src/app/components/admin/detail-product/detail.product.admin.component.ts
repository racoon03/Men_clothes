import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../enviroments/enviroment';
import { DetailProductResponse } from '../../responses/product/detail.product.response';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product';
import { ProductImage } from 'src/app/models/product.image';
import { ProductDTO } from 'src/app/dtos/product/product.dto';
import { CategoryService } from 'src/app/services/category.service';
import { ColorService } from 'src/app/services/color.service';
import { SizeService } from 'src/app/services/size.service';
import { Category } from 'src/app/models/category';
import { Color } from 'src/app/models/color';
import { Size } from 'src/app/models/size';
import { ProductVariantService } from 'src/app/services/product.variant.service';
import { ProductVariant } from 'src/app/models/product.variant';
import { CreateProductVariantDTO } from 'src/app/dtos/product/create.product.variant.dto';
import { TokenService } from 'src/app/services/token.service';
import { OrderService } from 'src/app/services/order.service';
import { COLOR_MAPPING, getColorCodeById } from 'src/app/components/color/color.mapping';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-detail-product-admin',
  templateUrl: './detail.product.admin.component.html',
  styleUrls: ['./detail.product.admin.component.scss']
})

export class DetailProductAdminComponent implements OnInit, AfterViewInit {    
  //@ViewChild('fileInput') fileInput!: ElementRef;
  
  productId: number = 0;
  product?: Product;
  productVariants: ProductVariant[] = [];
  isPopoverOpen = false;
  isEditing: boolean = false;
  categories: Category[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];
  showAddVariantForm: boolean = false;
  token: string = '';
  selectedFiles: FileList | null = null;
  
  // Stats counters
  soldCount: number = 0;
  cancelledCount: number = 0;
  totalStock: number = 0;
  // Biểu đồ thống kê sản phẩm
  private salesChart: any;
  // nhap hàng
  currentVariant: ProductVariant | null = null;
  importQuantity: number = 1;
  importNote: string = '';
  showImportForm: boolean = false;

  // Thêm các thuộc tính mới vào class DetailProductAdminComponent
  importPrice: number = 0;
  importSupplier: string = '';
  importDate: Date = new Date();
  importHistory: any[] = [];
  
  //mau variant
  colorMap: {[key: number]: string} = {};
  // Biến cho form thêm biến thể mới
  newVariant: {
    colorId: number | null;
    sizeId: number | null;
    quantity: number;
  } = {
    colorId: null,
    sizeId: null,
    quantity: 1
  };

  productResponse: DetailProductResponse = {
    id: 0,
    name: '',
    price: 0,
    thumbnail: '',
    description: null,
    category: {
      id: 0,
      name: ''
    },
    color: {
      id: 0,
      name: ''
    },
    size: {
      id: 0,
      name: ''
    }
  };  

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private colorService: ColorService,
    private sizeService: SizeService,
    private productVariantService: ProductVariantService,
    private tokenService: TokenService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.tokenService.getToken();
    this.loadCategories();
    this.loadColors();
    this.loadSizes();
    this.getProductDetails();
    this.loadProductImages();
    this.loadProductVariants();
    this.loadProductStats();
    this.colorMap = {...COLOR_MAPPING};
    //this.loadImportHistory();
  }

  ngAfterViewInit(): void {
        // Khởi tạo biểu đồ sau khi view đã được khởi tạo
    this.initSalesChart();
  }

   // Phương thức khởi tạo biểu đồ
    initSalesChart(): void {
        const chartElement = document.getElementById('salesChart') as HTMLCanvasElement;
        if (!chartElement) return;
        
        this.salesChart = new Chart(chartElement, {
            type: 'bar',
            data: {
                labels: ['Đã bán', 'Đã hủy', 'Tồn kho'],
                datasets: [{
                    label: 'Số lượng',
                    data: [this.soldCount, this.cancelledCount, this.totalStock],
                    backgroundColor: [
                        'rgba(28, 200, 138, 0.8)',  // Màu cho Đã bán
                        'rgba(231, 74, 59, 0.8)',   // Màu cho Đã hủy
                        'rgba(78, 115, 223, 0.8)'   // Màu cho Tồn kho
                    ],
                    borderColor: [
                        'rgba(28, 200, 138, 1)',
                        'rgba(231, 74, 59, 1)',
                        'rgba(78, 115, 223, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0 // Chỉ hiển thị số nguyên
                        }
                    }
                }
            }
        });
    }
    
    // Cập nhật biểu đồ khi dữ liệu thay đổi
    updateSalesChart(): void {
        if (this.salesChart) {
            this.salesChart.data.datasets[0].data = [this.soldCount, this.cancelledCount, this.totalStock];
            this.salesChart.update();
        }
    }
  
  // Thêm phương thức reload trang hiện tại
  reloadPage(): void {
    // Tải lại dữ liệu mà không làm mới trang
    this.loadCategories();
    this.loadColors();
    this.loadSizes();
    this.getProductDetails();
    this.loadProductImages();
    this.loadProductVariants();
    this.loadProductStats();
    
    // Hiển thị thông báo
    alert('Đã tải lại dữ liệu thành công!');
  }
  // Mở form nhập hàng với dữ liệu mặc định
  openImportForm(variant: ProductVariant): void {
  this.currentVariant = variant;
  this.importQuantity = 1;
  this.importPrice = 0;
  this.importSupplier = '';
  this.importDate = new Date();
  this.importNote = '';
  this.showImportForm = true;
  this.showAddVariantForm = false; // Đóng form thêm biến thể nếu đang mở
  }
  
  // Kiểm tra dữ liệu nhập hàng hợp lệ
  isImportDataValid(): boolean {
    return this.importQuantity > 0 && this.importPrice > 0;
  }

  // Đóng/mở form nhập hàng
  toggleImportForm(): void {
    this.showImportForm = !this.showImportForm;
    if (!this.showImportForm) {
      this.resetImportForm();
    }
  }
  
  // Reset form nhập hàng
  resetImportForm(): void {
    this.currentVariant = null;
    this.importQuantity = 1;
    this.importNote = '';
  }

  // Xử lý nhập hàng
importStock(): void {
  if (!this.currentVariant) {
    alert('Vui lòng chọn biến thể sản phẩm');
    return;
  }
  
  if (!this.isImportDataValid()) {
    alert('Vui lòng nhập đầy đủ số lượng và giá nhập');
    return;
  }
  
  const importData = {
    variant_id: this.currentVariant.id,
    product_id: this.productId,
    color_id: this.currentVariant.color?.id,
    size_id: this.currentVariant.size?.id,
    additional_quantity: this.importQuantity,
    import_price: this.importPrice,
    supplier: this.importSupplier,
    import_date: this.importDate,
    note: this.importNote
  };
  
  this.productVariantService.importStock(importData).subscribe({
    next: (response) => {
      alert('Nhập hàng thành công!');
      this.toggleImportForm(); // Đóng form
      this.loadProductVariants(); // Tải lại danh sách biến thể
      this.calculateTotalStock(); // Cập nhật tổng tồn kho
      //this.loadImportHistory(); // Tải lại lịch sử nhập hàng
    },
    error: (error) => {
      console.error('Lỗi khi nhập hàng:', error);
      alert('Có lỗi khi nhập hàng: ' + (error.message || 'Không xác định'));
    }
  });
}

  // Nạp lịch sử nhập hàng
  // loadImportHistory(): void {
  //   this.productVariantService.getImportHistory(this.productId).subscribe({
  //     next: (data) => {
  //       this.importHistory = data;
  //     },
  //     error: (error) => {
  //       console.error('Lỗi khi tải lịch sử nhập hàng:', error);
  //     }
  //   });
  // }
  
  // Xử lý xóa mềm biến thể (đưa số lượng về 0)
  softDeleteVariant(variant: ProductVariant): void {
    if (confirm('Bạn có chắc chắn muốn xóa biến thể này? Số lượng sẽ được đặt về 0.')) {
      this.productVariantService.updateQuantityToZero(variant.id as number).subscribe({
        next: (response) => {
          alert('Đã đặt số lượng về 0 thành công!');
          this.loadProductVariants(); // Tải lại danh sách biến thể
          this.calculateTotalStock(); // Cập nhật tổng tồn kho
        },
        error: (error) => {
          console.error('Lỗi khi xóa mềm biến thể:', error);
          alert('Có lỗi khi cập nhật: ' + (error.message || 'Không xác định'));
        }
      });
    }
  }
  
  // Tải danh sách danh mục
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  // Tải danh sách màu sắc
  loadColors(): void {
    this.colorService.getColors().subscribe({
      next: (colors: Color[]) => {
        this.colors = colors;
      },
      error: (error: any) => {
        console.error('Error loading colors:', error);
      }
    });
  }

  // Tải danh sách kích cỡ
  loadSizes(): void {
    this.sizeService.getSizes().subscribe({
      next: (sizes: Size[]) => {
        this.sizes = sizes;
      },
      error: (error: any) => {
        console.error('Error loading sizes:', error);
      }
    });
  }

  // Lấy thông tin chi tiết sản phẩm
  getProductDetails(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductDetailById(this.productId).subscribe({
      next: (response: any) => {        
        this.productResponse.id = response.id;
        this.productResponse.name = response.name;
        this.productResponse.price = response.price;
        this.productResponse.description = response.description;
        this.productResponse.category = {
          id: response.category?.id || 0, 
          name: response.category?.name || ''
        };

        this.productResponse.color = {
          id: response.color?.id || 0,
          name: response.color?.name || ''
        };

        this.productResponse.size = {
          id: response.size?.id || 0,
          name: response.size?.name || ''
        };
      },
      error: (error: any) => {
        console.error('Error fetching product details:', error);
      }
    });
  }

  // Tải danh sách biến thể sản phẩm
  loadProductVariants(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productVariantService.getProductVariants(this.productId).subscribe({
      next: (variants: ProductVariant[]) => {
        this.productVariants = variants;
      },
      error: (error: any) => {
        console.error('Error loading product variants:', error);
      }
    });
  }

  // Hiển thị ảnh sản phẩm
  loadProductImages(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam !== null) {
        this.productId = +idParam;
    }

    if (!isNaN(this.productId)) {
        this.productService.getDetailProduct(this.productId).subscribe({
            next: (response: any) => {
                this.showDetailProductImage(response);
            },
            error: (error: any) => {
                console.error('Error fetching product images:', error);
            }
        });    
    } else {
        console.error('Invalid productId:', idParam);
    }
  }

  showDetailProductImage(response: any): void {
    if (response.product_images && response.product_images.length > 0) {
        response.product_images.forEach((product_image: ProductImage) => {
            product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
        });
    }
    this.product = response;
  }

  // Hàm bật/tắt chế độ chỉnh sửa
  toggleEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    // Reset lại dữ liệu khi hủy
    this.getProductDetails();
  }

  // Hàm lưu thông tin sản phẩm
  saveChanges(): void {
    this.isEditing = false;
    
    // Tạo đối tượng ProductDTO để gửi lên server
    const productDTO = new ProductDTO({
      name: this.productResponse.name,
      price: this.productResponse.price,
      thumbnail: this.productResponse.thumbnail,
      description: this.productResponse.description,
      category_id: this.productResponse.category.id
    });
    
    this.productService.updateProduct(this.productId, productDTO).subscribe({
      next: (response: any) => {
        alert('Cập nhật sản phẩm thành công!');
        this.getProductDetails();
        this.loadProductImages();
      },
      error: (error: any) => {
        console.error('Error updating product:', error);
        alert('Có lỗi khi cập nhật sản phẩm: ' + (error.message || 'Không xác định'));
      }
    });
  }

  // Hiển thị/ẩn form thêm biến thể
  toggleAddVariantForm(): void {
    this.showAddVariantForm = !this.showAddVariantForm;
    if (!this.showAddVariantForm) {
      // Reset form
      this.newVariant = {
        colorId: null,
        sizeId: null,
        quantity: 1
      };
    }
  }
  
  // Lưu biến thể mới
  saveVariant(): void {
    if (!this.newVariant.colorId || !this.newVariant.sizeId || this.newVariant.quantity < 1) {
      alert('Vui lòng điền đầy đủ thông tin biến thể');
      return;
    }
    
    const variantDTO = new CreateProductVariantDTO({
      product_id: this.productId,
      color_id: this.newVariant.colorId,
      size_id: this.newVariant.sizeId,
      quantity: this.newVariant.quantity
    });
    
    this.productVariantService.createProduct(variantDTO).subscribe({
      next: (response) => {
        alert('Thêm biến thể thành công');
        this.loadProductVariants(); // Reload variants
        this.toggleAddVariantForm(); // Hide form
      },
      error: (error) => {
        console.error('Error creating variant:', error);
        alert(`Lỗi khi thêm biến thể: ${error.message || 'Không xác định'}`);
      }
    });
  }

  canAddImage(): boolean {
    return this.product?.product_images ? this.product.product_images.length < 5 : true;
  }

  handleOptionClick(index: number): void {
    if(index === 0) {
      this.router.navigate(['/admin/product-colors', this.productId]);                      
    } else if (index === 1) {
      this.router.navigate(['/admin/product-sizes', this.productId]);
    } else if (index === 2) {
      this.router.navigate(['/admin/product-variants', this.productId]);
    }
    this.isPopoverOpen = false;   
  }

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }
  
  // Mở dialog chọn file
  // openImageUploadDialog(): void {
  //   this.fileInput.nativeElement.click();
  // }
  openFileSelector(): void {
    // Tạo một input element tạm thời
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = 'image/*';
    
    // Xử lý sự kiện khi file được chọn
    fileInput.addEventListener('change', (event: any) => {
      this.selectedFiles = event.target.files;
      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.uploadImages();
      }
    });
    
    // Mở hộp thoại chọn file
    fileInput.click();
  }

  // Xử lý khi file được chọn
  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.uploadImages();
    }
  }
  
  // Upload ảnh lên server
  uploadImages(): void {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất một ảnh để tải lên');
      return;
    }
    
    const formData = new FormData();
    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('files', this.selectedFiles[i]);
    }
    
    this.productService.saveProductImages(this.productId, formData, this.token)
      .subscribe({
        next: (response) => {
          alert('Tải ảnh lên thành công!');
          this.loadProductImages(); // Tải lại danh sách ảnh
          this.selectedFiles = null;
          //this.fileInput.nativeElement.value = '';
        },
        error: (error) => {
          console.error('Lỗi khi tải ảnh lên:', error);
          alert('Có lỗi xảy ra khi tải ảnh lên. Chi tiết: ' + (error.message || error));
        }
      });
  }
  
  // Tải thống kê sản phẩm
  loadProductStats(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Lấy số lượng sản phẩm đã bán
    this.orderService.getProductSoldCount(this.productId).subscribe({
      next: (count: number) => {
        this.soldCount = count;
        this.updateSalesChart();
      },
      error: (error) => {
        console.error('Error loading sold count:', error);
        this.soldCount = 0;
        this.updateSalesChart();
      }
    });
    
    // Lấy số lượng sản phẩm đã hủy
    this.orderService.getProductCancelledCount(this.productId).subscribe({
      next: (count: number) => {
        this.cancelledCount = count;
        this.updateSalesChart();
      },
      error: (error) => {
        console.error('Error loading cancelled count:', error);
        this.cancelledCount = 0;
        this.updateSalesChart();
      }
    });
    
    // Tính tổng tồn kho từ các biến thể
    this.calculateTotalStock();
  }
  
  // Tính tổng tồn kho từ các biến thể
  calculateTotalStock(): void {
    this.productVariantService.getProductVariants(this.productId).subscribe({
      next: (variants: ProductVariant[]) => {
        this.totalStock = variants.reduce((total, variant) => total + variant.quantity, 0);
        this.updateSalesChart();
      },
      error: (error) => {
        console.error('Error calculating total stock:', error);
        this.totalStock = 0;
        this.updateSalesChart();
      }
    });
  }

  // Helper functions for formatting and retrieving data
  formatDate(date: any): string {
    if (!date) return 'N/A';
    
    // Nếu date là đối tượng Date
    if (date instanceof Date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    // Nếu date là mảng từ API Java, [year, month, day, hour, minute]
    if (Array.isArray(date)) {
      const [year, month, day, hour = 0, minute = 0] = date;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Nếu là ISO string, chuyển sang Date rồi format
    if (typeof date === 'string') {
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {  // Kiểm tra ngày hợp lệ
          const day = dateObj.getDate().toString().padStart(2, '0');
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const year = dateObj.getFullYear();
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
      } catch (e) {
        return date;
      }
    }
    
    return 'N/A';
  }
  
  // Lấy tên màu từ biến thể sản phẩm
  getColorName(variant: any): string {
    if (!variant) return 'N/A';
    
    if (variant.color && variant.color.name) {
      return variant.color.name;
    }
    
    return 'N/A';
  }
  
  // Lấy tên kích thước từ biến thể sản phẩm
  getSizeName(variant: any): string {
    if (!variant) return 'N/A';
    
    if (variant.size && variant.size.name) {
      return variant.size.name;
    }
    
    return 'N/A';
  }

  getColorCodeByVariant(variant: any): string {
    if (!variant || !variant.color || variant.color.id === undefined) return '#cccccc';
      return getColorCodeById(variant.color.id);
  }
}