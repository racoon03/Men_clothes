// admin.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TokenService } from 'src/app/services/token.service';
import { UserResponse } from '../responses/user/user.response';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  userResponse?: UserResponse | null;
  userName: string = 'Admin User';
  isSidebarCollapsed: boolean = false;
  currentRoute: string = 'dashboard';
  
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router,
  ) {
    // Subscribe to router events to update active menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      if (url.includes('/admin/orders')) {
        this.currentRoute = 'orders';
      } else if (url.includes('/admin/categories')) {
        this.currentRoute = 'categories';
      } else if (url.includes('/admin/products')) {
        this.currentRoute = 'products';
      } else if (url.includes('/admin/users')) {
        this.currentRoute = 'users';
      } else if (url.includes('/admin/coupons')) {
        this.currentRoute = 'coupons';
      }
    });
  }
  
  ngOnInit() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    // Sử dụng hàm getUserName() từ UserService để lấy tên người dùng
    this.userName = this.userService.getUserName();
    
    // Check local storage for sidebar state
    const savedState = localStorage.getItem('adminSidebarState');
    if (savedState) {
      this.isSidebarCollapsed = savedState === 'collapsed';
    }
    
    // Default router - thay đổi thành dashboard
    this.router.navigate(['/admin/dashboard']);
  }
  
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    // Save sidebar state to local storage
    localStorage.setItem('adminSidebarState', this.isSidebarCollapsed ? 'collapsed' : 'expanded');
  }
  
  logout() {
    this.userService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
    this.router.navigate(['/']);
  }
  
  showAdminComponent(componentName: string): void {
    this.currentRoute = componentName;
    this.router.navigate([`/admin/${componentName}`]);
  }
  
  isActive(route: string): boolean {
    return this.currentRoute === route;
  }
  
  getPageTitle(): string {
    switch (this.currentRoute) {
      case 'dashboard':
        return 'Tổng quan';
      case 'orders':
        return 'Quản lý đơn hàng';
      case 'categories':
        return 'Quản lý danh mục';
      case 'products':
        return 'Quản lý sản phẩm';
      case 'products':
        return 'Quản lý người dùng';
      case 'coupons':
        return 'Quản lý mã giảm giá';
      default:
        return 'Bảng điều khiển';
    }
  }

}