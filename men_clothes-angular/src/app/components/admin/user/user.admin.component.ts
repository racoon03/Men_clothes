import { Component, OnInit } from '@angular/core';
import { UserResponse } from 'src/app/components/responses/user/user.response';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user.admin.component.html',
  styleUrls: ['./user.admin.component.scss']
})
export class UserAdminComponent implements OnInit {
  // Danh sách người dùng
  users: UserResponse[] = [];
  
  // Biến phân trang
  currentPage: number = 1;
  totalPages: number = 0;
  limit: number = 8; // Đổi từ 10 thành 8 người dùng mỗi trang
  
  // Biến tìm kiếm
  keyword: string = '';
  
  // Biến loading và thông báo
  isLoading: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
  toastTimeout: any;
  
  // Modal xác nhận
  showConfirmModal: boolean = false;
  userToUpdate: UserResponse | null = null;
  newActiveStatus: boolean = false;
  
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }
  
  /**
   * Lấy số lượng người dùng đang hoạt động
   */
  getActiveUsersCount(): number {
    return this.users.filter(user => user.is_active).length;
  }

  /**
   * Lấy số lượng người dùng bị khóa
   */
  getInactiveUsersCount(): number {
    return this.users.filter(user => !user.is_active).length;
  }

  /**
   * Tải danh sách người dùng
   */
  loadUsers(): void {
    this.isLoading = true;
    
    this.userService.getAllUsers(this.keyword, this.currentPage, this.limit).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalPages = response.total_pages;
        
        // Đảm bảo trang hiện tại không vượt quá tổng số trang
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = 1;
          this.loadUsers(); // Tải lại với trang 1
          return;
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        this.showToastMessage('Đã xảy ra lỗi khi tải danh sách người dùng', 'error');
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Tìm kiếm người dùng
   */
  searchUsers(): void {
    this.currentPage = 1; // Reset về trang đầu tiên khi tìm kiếm
    this.loadUsers();
  }
  
  /**
   * Xóa từ khóa tìm kiếm
   */
  clearSearch(): void {
    this.keyword = '';
    this.currentPage = 1;
    this.loadUsers();
  }
  
  /**
   * Chuyển đến trang được chọn
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }
  
  /**
   * Tạo mảng số trang để hiển thị phân trang
   */
  getPaginationRange(): number[] {
    const maxPagesToShow = 5;
    const pages: number[] = [];
    
    // Tính toán phạm vi trang để hiển thị
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    // Điều chỉnh lại startPage nếu cần
    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Tạo mảng các số trang
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  /**
   * Hiển thị modal xác nhận thay đổi trạng thái
   */
  showStatusConfirmModal(user: UserResponse): void {
    this.userToUpdate = user;
    this.newActiveStatus = !user.is_active;
    this.showConfirmModal = true;
  }
  
  /**
   * Hủy thay đổi trạng thái
   */
  cancelStatusUpdate(): void {
    this.showConfirmModal = false;
    this.userToUpdate = null;
  }
  
  /**
   * Xác nhận thay đổi trạng thái
   */
  confirmStatusUpdate(): void { 
    if (this.userToUpdate?.role.id === 2) {
      alert('Không thể khóa tài khoản admin!');
    }
    if (this.userToUpdate) {
      this.toggleUserStatus(this.userToUpdate);
      this.showConfirmModal = false;
    }
  }
  
  /**
   * Toggle trạng thái người dùng (active/inactive)
   */
  toggleUserStatus(user: UserResponse): void {
    this.isLoading = true;
    
    // Xác định trạng thái mới (ngược lại với trạng thái hiện tại)
    const newStatus = !user.is_active;
    
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser) => {
        // Cập nhật lại thông tin người dùng trong danh sách
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        
        // Hiển thị thông báo thành công
        const message = newStatus 
          ? `Đã mở khóa người dùng ${user.fullname}` 
          : `Đã khóa người dùng ${user.fullname}`;
        this.showToastMessage(message, 'success');
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi thay đổi trạng thái người dùng:', error);
        this.showToastMessage('Đã xảy ra lỗi khi thay đổi trạng thái người dùng', 'error');
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Hiển thị thông báo toast
   */
  showToastMessage(message: string, type: 'success' | 'error' = 'success'): void {
    // Xóa timeout cũ nếu có
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    // Cập nhật thông báo
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    // Tự động ẩn sau 3 giây
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 3000);
  }
  
  /**
   * Ẩn thông báo toast
   */
  hideToast(): void {
    this.showToast = false;
  }
}