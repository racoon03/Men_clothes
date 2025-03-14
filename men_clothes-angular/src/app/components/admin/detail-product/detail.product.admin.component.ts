import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { OrderResponse } from '../../responses/order/order.response';
import { OrderDetail } from 'src/app/models/order.detail';
import { OrderDTO } from 'src/app/dtos/order/order.dto';
import { DetailProductResponse } from '../../responses/product/detail.product.response';
import { ProductService } from 'src/app/services/product.service';
import { Product } from 'src/app/models/product';
import { ProductImage } from 'src/app/models/product.image';
import { ProductDTO } from 'src/app/dtos/product/product.dto';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';



@Component({
  selector: 'app-detail-product-admin',
  templateUrl: './detail.product.admin.component.html',
  styleUrls: ['./detail.product.admin.component.scss']
})

export class DetailProductAdminComponent implements OnInit{    
  productId: number = 0;
  product?: Product;
  isPopoverOpen = false;
  isEditing: boolean = false; // Trạng thái chỉnh sửa
  productResponse: DetailProductResponse = {
    id: 0, // Hoặc bất kỳ giá trị số nào bạn muốn
    name: '',
    price: 0,
    thumbnail: '',
    description: null, // Giá trị có thể là null
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
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.getProductDetails();
    this.loadProductDetails();
  }
  
  // Hàm bật/tắt chế độ chỉnh sửa
  toggleEdit(): void {
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  // Hàm lưu thông tin sản phẩm
  saveChanges(): void {
    this.isEditing = false;
    this.productService
      .updateProduct(this.productId, new ProductDTO(this.productResponse))
      .subscribe({
      next: (response: any) => {
        debugger
        // Handle the successful update
        console.log('Order updated successfully:', response);
        // Navigate back to the previous page
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      complete: () => {
        debugger;        
      },
      error: (error: any) => {
        // Handle the error
        debugger
        console.error('Error updating order:', error);
      }
    });
  }

  getProductDetails(): void {
    debugger
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductDetailById(this.productId).subscribe({
      next: (response: any) => {        
        debugger;       
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
        debugger   
      },
      complete: () => {
        debugger;        
      },
      error: (error: any) => {
        debugger;
        console.error('Error fetching detail:', error);
      }
    });
  }    
  
  // hien thi anh product
  loadProductDetails(): void {
    // Lấy productId từ URL
    const idParam = this.route.snapshot.paramMap.get('id');
    debugger;
    
    if (idParam !== null) {
        this.productId = +idParam;
    }

    if (!isNaN(this.productId)) {
        this.productService.getDetailProduct(this.productId).subscribe({
            next: (response: any) => {
                debugger;
                // Gọi hàm xử lý ảnh sản phẩm
                this.showDetailProductImage(response);
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

  showDetailProductImage(response: any): void {
    if (response.product_images && response.product_images.length > 0) {
        response.product_images.forEach((product_image: ProductImage) => {
            product_image.image_url = `${environment.apiBaseUrl}/products/images/${product_image.image_url}`;
        });
    }
    this.product = response;
  }

  canAddImage(): boolean {
    return this.product?.product_images ? this.product.product_images.length <= 4 : false;
  }

  handleOptionClick(index: number): void {
    if(index === 0) {
      debugger
      this.router.navigate(['/user-profile']);                      
    } else if (index === 2) {
      this.router.navigate(['/user-profile']);
    }
    this.isPopoverOpen = false;   
  }

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }
  
}