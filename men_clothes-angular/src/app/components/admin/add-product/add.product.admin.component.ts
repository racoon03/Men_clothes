import { Component, ViewChild, OnInit } from '@angular/core';
import { 
  FormBuilder, 
  FormGroup, 
  Validators,
  ValidationErrors, 
  ValidatorFn, 
  AbstractControl
} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { CategoryService } from 'src/app/services/category.service';
import { ColorService } from 'src/app/services/color.service';
import { Color } from 'src/app/models/color';
import { Size } from 'src/app/models/size';
import { SizeService } from '../../../services/size.service';
import { Category } from 'src/app/models/category';
import { CreateProductVariantDTO } from 'src/app/dtos/product/create.product.variant.dto';
import { ProductService } from 'src/app/services/product.service';
import { ProductDTO } from 'src/app/dtos/product/product.dto';
import { ProductVariantService } from 'src/app/services/product.variant.service';
import { TokenService } from 'src/app/services/token.service';
import { COLOR_MAPPING } from 'src/app/components/color/color.mapping';

@Component({
  selector: 'add-product-admin',
  templateUrl: './add.product.admin.component.html',
  styleUrls: ['./add.product.admin.component.scss']
})
export class AddProductAdminComponent implements OnInit {
  createProductForm!: FormGroup;
  categories: Category[] = [];
  colors: Color[] = [];
  sizes: Size[] = [];
  
  // Các mảng lưu trữ giá trị người dùng đã chọn
  selectedCategoryIds: number = 0;
  selectedVariants: any[] = [];
  token: string = '';
  selectedFiles: FileList | null = null;
  previewUrls: string[] = []; // Mảng lưu URL xem trước ảnh
  
  // Sử dụng bản đồ màu sắc từ file color-mapping
  colorMap = COLOR_MAPPING;
  
  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private colorService: ColorService,
    private categoryService: CategoryService,
    private sizeService: SizeService,
    private productService: ProductService,
    private productVariantService: ProductVariantService,
    private tokenService: TokenService,
  ) {
    this.createProductForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      categories: [null, [Validators.required]],
      color: [null],
      size: [null],
      quantity: [1, [Validators.min(1)]],
      image: [null]
    });
  }
  
  ngOnInit(): void {
    this.getColors();
    this.getSizes();
    this.getCategories();
    this.token = this.tokenService.getToken();
  }
  
  // Xử lý khi chọn file ảnh
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = event.target.files;
      console.log('Đã chọn', this.selectedFiles?.length, 'file(s)');
      
      // Tạo URLs xem trước cho các ảnh đã chọn
      this.previewUrls = [];
      if (this.selectedFiles) {
        // Giới hạn số lượng ảnh
        const maxFiles = 5;
        const filesToPreview = Math.min(this.selectedFiles.length, maxFiles);
        
        for (let i = 0; i < filesToPreview; i++) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.previewUrls.push(e.target.result);
          };
          reader.readAsDataURL(this.selectedFiles[i]);
        }
        
        const fileNames = Array.from(this.selectedFiles).map(file => file.name);
        console.log('Tên các file:', fileNames);
      }
    } else {
      this.selectedFiles = null;
      this.previewUrls = [];
      console.log('Không có file nào được chọn');
    }
  }
  
  // Xóa ảnh khỏi preview
  removeImage(index: number): void {
    if (this.previewUrls.length > index) {
      // Xóa URL xem trước
      this.previewUrls.splice(index, 1);
      
      // Xóa file từ FileList
      if (this.selectedFiles) {
        // Tạo một đối tượng DataTransfer mới để lưu trữ các file còn lại
        const dt = new DataTransfer();
        
        // Thêm tất cả các file ngoại trừ file cần xóa
        for (let i = 0; i < this.selectedFiles.length; i++) {
          if (i !== index) {
            dt.items.add(this.selectedFiles[i]);
          }
        }
        
        // Cập nhật lại selectedFiles
        this.selectedFiles = dt.files;
        
        // Log để debug
        console.log('Còn lại', this.selectedFiles.length, 'file(s) sau khi xóa');
      }
    }
  }
  
  // Thêm biến thể sản phẩm
  addVariant() {
    const colorId = this.createProductForm.get('color')?.value;
    const sizeId = this.createProductForm.get('size')?.value;
    const quantity = this.createProductForm.get('quantity')?.value || 0;
    console.log('Thêm biến thể với colorId:', colorId, 'sizeId:', sizeId, 'quantity:', quantity);
    
    // Kiểm tra xem đã chọn đủ thông tin chưa
    if (!colorId || !sizeId || quantity <= 0) {
      alert('Vui lòng chọn đầy đủ màu sắc, kích cỡ và nhập số lượng hợp lệ');
      console.log('colorId:', colorId);
      console.log('sizeId:', sizeId);
      console.log('quantity:', quantity);
      return;
    }
    
    // Kiểm tra xem biến thể này đã tồn tại chưa
    const existingVariant = this.selectedVariants.find(v =>
      v.colorId === colorId && v.sizeId === sizeId
    );
    
    if (existingVariant) {
      alert('Biến thể này đã tồn tại trong danh sách');
      return;
    }
    
    // Thêm vào mảng
    this.selectedVariants.push({
      colorId: colorId,
      sizeId: sizeId,
      quantity: quantity
    });
    
    // Reset các trường sau khi thêm
    this.createProductForm.patchValue({
      color: null,
      size: null,
      quantity: 1
    });
  }
  
  // Xóa biến thể khỏi danh sách
  removeVariant(index: number): void {
    if (index >= 0 && index < this.selectedVariants.length) {
      this.selectedVariants.splice(index, 1);
    }
  }
  
  // Lấy mã màu từ ID sử dụng bản đồ màu từ file color-mapping
  getColorCode(colorId: number): string {
    return COLOR_MAPPING[colorId] || '#cccccc'; // Màu mặc định nếu không tìm thấy
  }
  
  getColorName(colorId: number): string {
    if (!this.colors || this.colors.length === 0) {
      return 'Đang tải...';
    }
    const colorIdNum = Number(colorId);
    const color = this.colors.find(c => c.id === colorIdNum);
    return color ? color.name : 'Không xác định';
  }

  getSizeName(sizeId: number): string {
    if (!this.sizes || this.sizes.length === 0) {
      return 'Đang tải...';
    }
    const sizeIdNum = Number(sizeId);
    const size = this.sizes.find(s => s.id === sizeIdNum);
    return size ? size.name : 'Không xác định';
  }

  
  // Lưu sản phẩm
  save(): void {
    // Kiểm tra form có hợp lệ không
    if (this.createProductForm.invalid) {
      // Đánh dấu tất cả các trường đã được tương tác để hiển thị lỗi
      Object.keys(this.createProductForm.controls).forEach(key => {
        const control = this.createProductForm.get(key);
        control?.markAsTouched();
      });
      
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    // Kiểm tra có biến thể nào không
    if (this.selectedVariants.length === 0) {
      alert('Vui lòng thêm ít nhất một biến thể sản phẩm');
      return;
    }
    
    // Kiểm tra có chọn ảnh không
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất một ảnh cho sản phẩm');
      return;
    }
    
    console.log('Các biến thể đã chọn:', this.selectedVariants);
    
    // Tạo đối tượng ProductDTO
    const createProduct: ProductDTO = {
      name: this.createProductForm.get('name')?.value,
      price: this.createProductForm.get('price')?.value,
      thumbnail: '',
      description: this.createProductForm.get('description')?.value,
      category_id: this.createProductForm.get('categories')?.value,
    };
    
    // Gọi API tạo sản phẩm
    this.productService.createProduct(createProduct, this.token)
      .subscribe({
        next: (response: any) => {
          const productId = response.id;
          
          // Tạo mảng các DTO biến thể từ mảng selectedVariants
          const variantDTOs = this.selectedVariants.map(variant => {
            // Trích xuất và ép kiểu thành số nguyên
            let colorId = Array.isArray(variant.colorId) ? variant.colorId[0] : variant.colorId;
            let sizeId = Array.isArray(variant.sizeId) ? variant.sizeId[0] : variant.sizeId;
            
            // Thêm bước ép kiểu
            colorId = Number(colorId);
            sizeId = Number(sizeId);
            
            return new CreateProductVariantDTO({
              product_id: productId,
              color_id: colorId,
              size_id: sizeId,
              quantity: variant.quantity
            });
          });
          
          // Kiểm tra mảng có dữ liệu không
          if (variantDTOs.length > 0) {
            // Gọi service để lưu nhiều biến thể
            this.productVariantService.createProductVariants(variantDTOs, this.token)
              .subscribe({
                next: (variantResponse) => {
                  // Tiếp tục với việc lưu ảnh
                  this.saveProductImages(productId);
                },
                error: (variantError) => {
                  console.log(variantDTOs);
                  alert('Đã tạo sản phẩm nhưng có lỗi khi tạo biến thể: ' + variantError.error.message);
                  console.error('Lỗi khi tạo biến thể:', variantError);
                }
              });
          } else {
            alert('Tạo sản phẩm thành công, không có biến thể nào để tạo');
            this.saveProductImages(productId);
          }
        },
        error: (error: any) => {
          console.error('Lỗi khi tạo sản phẩm:', error);
          alert(error.error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
        }
      });
  }
  
  // Phương thức lưu ảnh sản phẩm
  private saveProductImages(productId: number): void {
    console.log('Bắt đầu lưu ảnh cho sản phẩm ID:', productId);
    
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      console.log('Chuẩn bị upload', this.selectedFiles.length, 'file(s)');
      
      // Giới hạn số lượng file nếu cần
      const maxFiles = 5;
      if (this.selectedFiles.length > maxFiles) {
        alert(`Chỉ tối đa ${maxFiles} ảnh được phép upload. Hệ thống sẽ chỉ xử lý ${maxFiles} ảnh đầu tiên.`);
      }
      
      // Tạo FormData
      const formData = new FormData();
      const filesToUpload = Math.min(this.selectedFiles.length, maxFiles);
      
      for (let i = 0; i < filesToUpload; i++) {
        formData.append('files', this.selectedFiles[i]);
        console.log('Đã thêm file:', this.selectedFiles[i].name, '(', this.selectedFiles[i].size, 'bytes)');
      }
      
      // Gọi service để upload
      this.productService.saveProductImages(productId, formData, this.token)
        .subscribe({
          next: (imageResponse) => {
            console.log('Upload ảnh thành công:', imageResponse);
            
            // Thêm chức năng mới: Cập nhật thumbnail từ ảnh đầu tiên được tải lên
            if (imageResponse && imageResponse.length > 0) {
              const firstImageUrl = imageResponse[0].image_url;
              
              // Gọi API để cập nhật thumbnail
              this.productService.updateProductThumbnail(productId, firstImageUrl, this.token)
                .subscribe({
                  next: (thumbnailResponse) => {
                    console.log('Cập nhật thumbnail thành công:', thumbnailResponse);
                    alert('Sản phẩm, ảnh và thumbnail đã được lưu thành công!');
                    this.router.navigate(['/admin/products']);
                  },
                  error: (thumbnailError) => {
                    console.error('Lỗi khi cập nhật thumbnail:', thumbnailError);
                    alert('Sản phẩm và ảnh đã được lưu, nhưng có lỗi khi cập nhật thumbnail: ' +
                      (thumbnailError.error?.message || 'Lỗi không xác định'));
                    this.router.navigate(['/admin/products']);
                  }
                });
            } else {
              alert('Sản phẩm đã được tạo thành công, nhưng không có ảnh nào được trả về từ server!');
              this.router.navigate(['/admin/products']);
            }
          },
          error: (imageError) => {
            console.error('Lỗi khi upload ảnh:', imageError);
            alert('Sản phẩm đã được tạo nhưng có lỗi khi upload ảnh: ' +
              (imageError.error?.message || 'Lỗi không xác định'));
            this.router.navigate(['/admin/products']);
          }
        });
    } else {
      console.log('Không có file nào để upload');
      alert('Sản phẩm đã được tạo thành công! Không có ảnh nào được upload.');
      this.router.navigate(['/admin/products']);
    }
  }
  
  // Lấy danh sách màu sắc từ API
  getColors() {
    this.colorService.getColors().subscribe({
      next: (colors: Color[]) => {
        this.colors = colors;
      },
      error: (error: any) => {
        console.error('Error fetching colors:', error);
      }
    });
  }
  
  // Lấy danh sách kích cỡ từ API
  getSizes() {
    this.sizeService.getSizes().subscribe({
      next: (sizes: Size[]) => {
        this.sizes = sizes;
      },
      error: (error: any) => {
        console.error('Error fetching sizes:', error);
      }
    });
  }
  
  // Lấy danh sách danh mục từ API
  getCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      }
    });
  }
}
