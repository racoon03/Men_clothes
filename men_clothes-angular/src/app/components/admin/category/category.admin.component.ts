// category.admin.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CategoryService } from 'src/app/services/category.service';
import { Category } from 'src/app/models/category';
import { CategoryDTO } from 'src/app/dtos/category/category.dto';

@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: ['./category.admin.component.scss']
})
export class CategoryAdminComponent implements OnInit {
  categories: Category[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 5; // Tăng số lượng hiển thị mỗi trang
  totalPages: number = 0;
  visiblePages: number[] = [];
  isAddingCategory: boolean = false;
  newCategory: Category = { id: 0, name: '' };

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Tải danh sách danh mục
   */
  loadCategories(): void {
    this.getCategories(this.currentPage, this.itemsPerPage);
  }

  /**
   * Lấy danh sách danh mục từ API
   */
  getCategories(page: number, limit: number): void {
  this.categoryService.getAllCategories().subscribe({
    next: (categories: Category[]) => {
      // Lưu toàn bộ danh sách
      const allCategories = categories;
      
      // Tính tổng số trang
      this.totalPages = Math.ceil(allCategories.length / this.itemsPerPage);
      
      // Cắt danh sách theo trang hiện tại
      const startIndex = page * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.categories = allCategories.slice(startIndex, endIndex).map(category => ({
        ...category,
        editMode: false
      }));
      
      this.updateVisiblePages();
    },
    error: (error: any) => {
      console.error('Lỗi khi tải danh mục:', error);
    }
  });
}

  /**
   * Cập nhật danh sách trang hiển thị trong phân trang
   */
  updateVisiblePages(): void {
    // Hiển thị tối đa 5 trang
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(0, this.currentPage - halfVisible);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);
    
    // Điều chỉnh nếu chưa đủ số lượng trang hiển thị
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    this.visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  /**
   * Chuyển đổi trang
   */
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.getCategories(this.currentPage, this.itemsPerPage);
    }
  }

  /**
   * Bật chế độ thêm danh mục
   */
  toggleAddCategory(): void {
    this.isAddingCategory = true;
  }

  /**
   * Hủy thêm danh mục
   */
  cancelAddCategory(): void {
    this.isAddingCategory = false;
    this.newCategory = { id: 0, name: '' };
  }

  /**
   * Tạo danh mục mới
   */
  createCategory(): void {
    if (!this.newCategory.name.trim()) {
      // Sử dụng toast hoặc thông báo đẹp hơn thay cho alert
      this.showNotification('Vui lòng nhập tên danh mục!', 'error');
      return;
    }

    this.categoryService.createCategory(this.newCategory).subscribe({
      next: (response: any) => {
        this.showNotification('Thêm danh mục thành công!', 'success');
        this.newCategory = { id: 0, name: '' };
        this.isAddingCategory = false;
        this.loadCategories();
      },
      error: (error: any) => {
        console.error('Lỗi khi thêm danh mục:', error);
        this.showNotification('Không thể thêm danh mục. Vui lòng thử lại!', 'error');
      }
    });
  }

  /**
   * Xóa danh mục
   */
  deleteCategory(id: number): void {
    // Sử dụng component xác nhận thay vì window.confirm
    if (this.confirmDelete()) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.showNotification('Đã xóa danh mục thành công!', 'success');
          this.loadCategories();
        },
        error: (error: any) => {
          console.error('Lỗi khi xóa danh mục:', error);
          this.showNotification('Không thể xóa danh mục. Vui lòng thử lại!', 'error');
        }
      });
    }
  }

  /**
   * Bật chế độ chỉnh sửa danh mục
   */
  editCategory(category: any): void {
    // Đóng tất cả các danh mục đang chỉnh sửa khác
    this.categories.forEach(c => {
      if (c.id !== category.id) {
        c.editMode = false;
      }
    });
    
    category.editMode = true;
  }

  /**
   * Lưu thay đổi danh mục
   */
  saveCategory(id: number, category: any): void {
    if (!category.name.trim()) {
      this.showNotification('Tên danh mục không được để trống!', 'error');
      return;
    }
    
    const categoryData = new CategoryDTO({
      id: id,
      name: category.name,
    });

    this.categoryService.updateCategory(id, categoryData).subscribe({
      next: (response: any) => {
        this.showNotification('Cập nhật danh mục thành công!', 'success');
        category.editMode = false;
      },
      error: (error: any) => {
        console.error('Lỗi khi cập nhật danh mục:', error);
        this.showNotification('Không thể cập nhật danh mục. Vui lòng thử lại!', 'error');
      }
    });
  }

  /**
   * Hiển thị hộp thoại xác nhận xóa
   */
  private confirmDelete(): boolean {
    return window.confirm('Bạn có chắc chắn muốn xóa danh mục này?');
  }

  /**
   * Hiển thị thông báo (giả lập)
   * Trong thực tế, bạn có thể sử dụng một thư viện toast như ngx-toastr
   */
  private showNotification(message: string, type: 'success' | 'error'): void {
    // Đây chỉ là giả lập, trong ứng dụng thực tế bạn sẽ dùng một component toast
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // Để tích hợp với thư viện toast, bạn sẽ sử dụng code như:
    // this.toastr.success(message); hoặc this.toastr.error(message);
  }
}