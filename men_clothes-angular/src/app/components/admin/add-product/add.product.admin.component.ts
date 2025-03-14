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

@Component({
  selector: 'add-product-admin',
  templateUrl: './add.product.admin.component.html',
  styleUrls: ['./add.product.admin.component.scss']
})
export class AddProductAdminComponent implements OnInit {
  createProductForm!: FormGroup;
  categories : Category[] = []; 
  colors : Color[] = [];
  sizes : Size[] = [];
    // Các mảng mới để lưu trữ giá trị người dùng đã chọn
  selectedCategoryIds: number = 0;
  selectedVariants: any[] = [];
  token: string = '';
  selectedFiles: FileList | null = null;
  
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

  )
  {        
    this.createProductForm = this.formBuilder.group({    
      name: ['', [Validators.minLength(3)]],       
      price: ['', [Validators.min(0)]], 
      description: [''],
      categories: [null],  // Thêm FormControl cho danh mục
      color: [null],      // Thêm control cho màu sắc
      size: [null],       // Thêm control cho kích cỡ
      quantity: [0],
      image: [null]
    });
  }
  
  ngOnInit(): void {
    debugger;
    this.getColors();
    this.getSizes();
    this.getCategories();
    this.token = this.tokenService.getToken();
  }

  // Thêm phương thức để xử lý sự kiện change
onFileChange(event: any) {
  if (event.target.files && event.target.files.length > 0) {
    this.selectedFiles = event.target.files;
    console.log('Đã chọn', this.selectedFiles?.length, 'file(s)');
    
    // Thêm kiểm tra null trước khi sử dụng Array.from
    if (this.selectedFiles) {
      const fileNames = Array.from(this.selectedFiles).map(file => file.name);
      console.log('Tên các file:', fileNames);
    }
  } else {
    this.selectedFiles = null;
    console.log('Không có file nào được chọn');
  }
}
  
  addVariant() {
    const colorId = this.createProductForm.get('color')?.value;
    const sizeId = this.createProductForm.get('size')?.value;
    const quantity = this.createProductForm.get('quantity')?.value || 0;
    
    // Kiểm tra xem đã chọn đủ thông tin chưa
    if (!colorId || !sizeId || quantity <= 0) {
      alert('Vui lòng chọn đầy đủ màu sắc, kích cỡ và nhập số lượng hợp lệ');
      console.log('colorId:', colorId);
      console.log('sizeId:', sizeId);
      console.log('quantity:', quantity);
      return;
    }
    
    // Kiểm tra xem biến thể này đã tồn tại chưa
    const existingVariant = this.selectedVariants.find(v => v.colorId === colorId && v.sizeId === sizeId);
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
      quantity: 0
    });
  }

  save(): void {
    console.log(this.selectedVariants);
    debugger
        //if (this.createProductForm.valid) {
          const createProduct: ProductDTO = {
            name: this.createProductForm.get('name')?.value,
            price: this.createProductForm.get('price')?.value,
            thumbnail: '',
            description: this.createProductForm.get('description')?.value,
            category_id: this.createProductForm.get('categories')?.value,
          };
          
          this.productService.createProduct(createProduct, this.token)
          .subscribe({
            next: (response: any) => {
              debugger
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
                  product_id: productId, // Thêm ID sản phẩm vào mỗi biến thể
                  color_id: colorId,
                  size_id: sizeId,
                  quantity: variant.quantity
                });
              });
              debugger
              // Kiểm tra mảng có dữ liệu không
              if (variantDTOs.length > 0) {
                // Gọi service để lưu nhiều biến thể
                this.productVariantService.createProductVariants(variantDTOs, this.token)
                  .subscribe({
                    next: (variantResponse) => {
                      alert('Thêm mới sản phẩm thành công');
                    },
                    error: (variantError) => {
                      console.log(variantDTOs);
                      alert('Đã tạo sản phẩm nhưng có lỗi khi tạo biến thể: ' + variantError.error.message);
                      console.error('Lỗi khi tạo biến thể:', variantError);
                    }
                  });
                
                
              } else {
                alert('Tạo sản phẩm thành công, không có biến thể nào để tạo');
              }
              this.saveProductImages(productId);
            },
            error: (error: any) => {
              console.error('Lỗi khi tạo sản phẩm:', error);
              alert(error.error.message);
            }
          });
        } 
  //}
  
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
          alert('Sản phẩm và ảnh đã được lưu thành công!');
          this.router.navigate(['/admin/products']);
        },
        error: (imageError) => {
          console.error('Lỗi khi upload ảnh:', imageError);
          alert('Sản phẩm đã được tạo nhưng có lỗi khi upload ảnh: ' + 
                (imageError.error?.message || 'Lỗi không xác định'));
        }
      });
    } else {
      console.log('Không có file nào để upload');
      alert('Sản phẩm đã được tạo thành công! Không có ảnh nào được upload.');
      this.router.navigate(['/admin/products']);
    }
  }
  getColors() {
      this.colorService.getColors().subscribe({
        next: (colors: Color[]) => {          
          this.colors = colors;
          },
          complete: () => {
            debugger;
          },
          error: (error: any) => {
            console.error('Error fetching colors:', error);
          }
        });
  } 
  getSizes() {
      this.sizeService.getSizes().subscribe({
        next: (sizes: Size[]) => {          
          this.sizes = sizes;
          },
          complete: () => {
            debugger;
          },
          error: (error: any) => {
            console.error('Error fetching sizes:', error);
          }
        });
    } 
   
  getCategories() {
      this.categoryService.getAllCategories().subscribe({
        next: (categories: Category[]) => {          
          this.categories = categories;
          },
          complete: () => {
            debugger;
          },
          error: (error: any) => {
            console.error('Error fetching sizes:', error);
          }
        });
  } 
  
  
   
}

