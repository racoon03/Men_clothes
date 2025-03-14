import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import { Observable } from 'rxjs';
import { OrderResponse } from '../../responses/order/order.response';
import { Location } from '@angular/common';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product.service';
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
  selectedCategoryId: number  = 0; // Giá trị category được chọn
  currentPage: number = 1;
  itemsPerPage: number = 9;
  pages: number[] = [];
  totalPages:number = 0;
  visiblePages: number[] = [];
  keyword: string = "";
  isPopoverOpen = false;


  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {

  }
  ngOnInit(): void {
    debugger
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
  }

  getProducts(keyword: string, selectedCategoryId: number, page: number, limit: number) {
      debugger
      this.productService.getProducts(keyword, selectedCategoryId, page, limit).subscribe({
        next: (response: any) => {
          debugger   
          this.products = response.products;
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        },
        complete: () => {
          debugger;
        },
        error: (error: any) => {
          debugger;
          console.error('Error fetching products:', error);
        }
      });    
  }
  
  onPageChange(page: number) {
    debugger;
    this.currentPage = page ;
    this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);
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

  deleteProduct(id:number) {
    const confirmation = window
      .confirm('Bạn chắc chắn muốn xóa sản phẩm này?');
    if (confirmation) {
      debugger
      this.productService.deleteProduct(id).subscribe({
        next: (response: any) => {
          debugger 
            this.getProducts(this.keyword, this.selectedCategoryId, this.currentPage, this.itemsPerPage);    
        },
        complete: () => {
          debugger;          
        },
        error: (error: any) => {
          debugger;
          console.error('Error fetching products:', error);
        }
      });    
    }
  }
  viewDetails(id:number) {
    debugger
    this.router.navigate(['/admin/products', id]);
  }

   handleOptionClick(index: number): void {
    if(index === 0) {
      debugger
      this.router.navigate(['admin/add-product']);                      
    }
    // else if (index === 2) {
    //   this.router.navigate(['/']);
    // }
    this.isPopoverOpen = false;   
  }

  togglePopover(event: Event): void {
    event.preventDefault();
    this.isPopoverOpen = !this.isPopoverOpen;
  }
}