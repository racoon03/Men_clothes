import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category';
import { CategoryDTO } from 'src/app/dtos/category/category.dto';

@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: [
    './category.admin.component.scss',        
  ]
})
export class CategoryAdminComponent implements OnInit {
  categories: Category[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 2;
  pages: number[] = [];
  editMode: boolean = false;
  totalPages:number = 0;
  visiblePages: number[] = [];
  isAddingCategory: boolean = false; // Kiểm soát trạng thái hiển thị input thêm danh mục
  newCategory: Category = { id: 0, name: '' };

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {

  }
  ngOnInit(): void {
    debugger
    this.getCategories(this.currentPage, this.itemsPerPage);
  }


  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (categories: Category[]) => {
            
          this.categories = categories.map(category => ({
            ...category,
            editMode: false // Mỗi category có editMode riêng
          }));
        },
        complete: () => {
          debugger;
        },
        error: (error: any) => {
          console.error('Error fetching categories:', error);
        }
      });
  }
  
  toggleAddCategory() {
    this.isAddingCategory = true;
  }

  cancelAddCategory() {
    this.isAddingCategory = false;
    this.newCategory = { id: 0, name: '' }; // Reset dữ liệu
  }

  createCategory() {
    if (!this.newCategory.name.trim()) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    this.categoryService.createCategory(this.newCategory).subscribe({
      next: (response: any) => {
        console.log('Danh mục đã được thêm:', response);
        this.categories.push({ ...response, editMode: false }); // Thêm danh mục vào danh sách
        this.newCategory = { id: 0, name: '' }; // Reset input
        this.isAddingCategory = false; // Ẩn ô nhập
        // Gọi lại API để lấy danh sách mới
        this.getCategories(this.currentPage, this.itemsPerPage);
      },
      error: (error: any) => console.error('Lỗi khi thêm danh mục:', error)
    });
  }



  deleteCategory(id:number) {
    const confirmation = window
      .confirm('Are you sure you want to delete this order?');
    if (confirmation) {
      debugger
      this.categoryService.deleteCategory(id).subscribe({
        next: (response: any) => {
          debugger 
          // Gọi lại API để lấy danh sách mới
          this.getCategories(this.currentPage, this.itemsPerPage);          
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

  editCategory(category: any) {
    if (!category || typeof category !== 'object') {
    console.error('Lỗi: category không hợp lệ trước khi chỉnh sửa:', category);
    return;
  }
  console.log('Chỉnh sửa category:', category);
    category.editMode = true;
  }

saveCategory(id: number, category: any) {
  const categoryData = new CategoryDTO({
    id: id,  // Giữ nguyên ID
    name: category.name, // Dữ liệu mới sau khi sửa
  });

  this.categoryService.updateCategory(id, categoryData).subscribe({
    next: (response: any) => {
      console.log('Category updated successfully:', response);
      category.editMode = false; // Tắt chế độ chỉnh sửa sau khi lưu
    },
    error: (error: any) => {
      console.error('Error updating category:', error);
    }
  });
}

}