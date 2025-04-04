import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/services/order.service';
import { OrderResponse } from '../../responses/order/order.response';

@Component({
  selector: 'app-order-admin',
  templateUrl: './order.admin.component.html',
  styleUrls: ['./order.admin.component.scss']
})
export class OrderAdminComponent implements OnInit {  
  // Orders data
  orders: OrderResponse[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  visiblePages: number[] = [];
  
  // Search and filters
  keyword: string = "";
  isFilterExpanded: boolean = false;
  statusFilter: string = "";
  paymentMethodFilter: string = "";
  monthFilter: string = "";
  yearFilter: string = "";
  minPriceFilter: number | null = null;
  maxPriceFilter: number | null = null;
  
  // Options for filters
  months = [
    { value: '1', label: 'Tháng 1' },
    { value: '2', label: 'Tháng 2' },
    { value: '3', label: 'Tháng 3' },
    { value: '4', label: 'Tháng 4' },
    { value: '5', label: 'Tháng 5' },
    { value: '6', label: 'Tháng 6' },
    { value: '7', label: 'Tháng 7' },
    { value: '8', label: 'Tháng 8' },
    { value: '9', label: 'Tháng 9' },
    { value: '10', label: 'Tháng 10' },
    { value: '11', label: 'Tháng 11' },
    { value: '12', label: 'Tháng 12' }
  ];
  
  years: number[] = [];
  
  // Modal
  showDeleteModal: boolean = false;
  orderIdToDelete: number = 0;
  selectedOrderId: number | null = null;
  
  // Stats counters
  pendingOrdersCount: number = 0;
  processingOrdersCount: number = 0;
  shippedOrdersCount: number = 0;
  deliveredOrdersCount: number = 0;
  cancelledOrdersCount: number = 0;
  
  // Math object for template use
  Math = Math;

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Generate year options (from 2020 to current year)
    const currentYear = new Date().getFullYear();
    for (let year = 2020; year <= currentYear; year++) {
      this.years.push(year);
    }
    
    // Initial data load
    this.getAllOrders();
  }
  
  /**
   * Get all orders with current filters
   */
  getAllOrders() {
    this.orderService.getAllOrders(this.keyword, this.currentPage - 1, this.itemsPerPage).subscribe({
      next: (response: any) => {       
        this.orders = response.orders;
        this.totalPages = response.totalPages;
        this.totalItems = response.totalItems || this.orders.length * this.totalPages;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        
        // Count orders by status
        this.calculateStatusCounts();
      },
      error: (error: any) => {
        console.error('Error fetching orders:', error);
      }
    });    
  }
  
  /**
 * Apply all filters and fetch filtered orders from API
 */
applyFilters(preservePage: boolean = false): void {
  // Chỉ reset về trang 1 khi không yêu cầu giữ nguyên trang
  if (!preservePage) {
    this.currentPage = 1;
  }
  
  // Check if any filter is active
  if (this.hasActiveFilters()) {
    // Lưu lại trang hiện tại để debug
    const requestPage = this.currentPage - 1;
    console.log(`Requesting filtered orders for page ${requestPage}, current page is ${this.currentPage}`);
    
    // Use the new filtered API endpoint
    this.orderService.getFilteredOrders(
      this.keyword,
      requestPage, // Truyền trang hiện tại trừ 1 (vì backend đếm từ 0)
      this.itemsPerPage,
      this.statusFilter,
      this.paymentMethodFilter,
      this.monthFilter ? parseInt(this.monthFilter) : undefined,
      this.yearFilter ? parseInt(this.yearFilter) : undefined,
      this.minPriceFilter || undefined,
      this.maxPriceFilter || undefined
    ).subscribe({
      next: (response: any) => {
        console.log('Filtered orders response:', response);
        this.orders = response.orders || [];
        this.totalPages = response.totalPages || 0;
        this.totalItems = response.totalItems || this.orders.length * this.totalPages;
        this.visiblePages = this.generateVisiblePageArray(this.currentPage, this.totalPages);
        
        // Count orders by status
        this.calculateStatusCounts();
      },
      error: (error: any) => {
        console.error('Error fetching filtered orders:', error);
      }
    });
  } else {
    // If no filters active, use regular endpoint
    this.getAllOrders();
  }
}
  
  /**
   * Check if any filter is active
   */
  hasActiveFilters(): boolean {
    return (
      (this.statusFilter != null && this.statusFilter !== "") ||
      (this.paymentMethodFilter != null && this.paymentMethodFilter !== "") ||
      (this.monthFilter != null && this.monthFilter !== "") ||
      (this.yearFilter != null && this.yearFilter !== "") ||
      this.minPriceFilter !== null ||
      this.maxPriceFilter !== null
    );
  }
  
  /**
   * Calculate counts for each order status
   */
  calculateStatusCounts(): void {
    this.pendingOrdersCount = this.orders.filter(order => order.status === 'pending').length;
    this.processingOrdersCount = this.orders.filter(order => order.status === 'processing').length;
    this.shippedOrdersCount = this.orders.filter(order => order.status === 'shipped').length;
    this.deliveredOrdersCount = this.orders.filter(order => order.status === 'delivered').length;
    this.cancelledOrdersCount = this.orders.filter(order => order.status === 'cancelled').length;
  }
  
  /**
   * Toggle filter panel visibility
   */
  toggleFilters(): void {
    this.isFilterExpanded = !this.isFilterExpanded;
  }
  
  /**
   * Search orders by keyword
   */
  searchOrders(): void {
    this.currentPage = 1; // Reset to first page
    
    if (this.hasActiveFilters()) {
      this.applyFilters(); // If filters active, use filter endpoint
    } else {
      this.getAllOrders(); // Otherwise use regular endpoint
    }
  }
  
  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.keyword = "";
    this.statusFilter = "";
    this.paymentMethodFilter = "";
    this.monthFilter = "";
    this.yearFilter = "";
    this.minPriceFilter = null;
    this.maxPriceFilter = null;
    this.currentPage = 1;
    
    this.getAllOrders();
  }
  
  /**
 * Handle page change in pagination
 */
  onPageChange(page: number) {
    console.log(`Page change requested: ${page}, current page: ${this.currentPage}, total pages: ${this.totalPages}`);
    
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      console.log('Invalid page change request, ignoring');
      return;
    }
    
    // Set the current page to the requested page
    this.currentPage = page;
    console.log(`Current page set to: ${this.currentPage}`);
    
    if (this.hasActiveFilters()) {
      // Call applyFilters with preservePage=true to maintain the current page
      this.applyFilters(true);
    } else {
      this.getAllOrders();
    }
  }

  /**
   * Generate visible page array for pagination
   */
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }
  
  /**
   * View order details
   */
  viewDetails(order: OrderResponse) {
    this.router.navigate(['/admin/orders', order.id]);
  }
  
  /**
   * Edit order
   */
  editOrder(order: OrderResponse) {
    this.router.navigate(['/admin/orders', order.id]);
  }
  
  /**
   * Show confirmation before deleting
   */
  confirmDelete(orderId: number): void {
    this.orderIdToDelete = orderId;
    this.showDeleteModal = true;
  }
  
  /**
   * Cancel delete action
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.orderIdToDelete = 0;
  }
  
  /**
   * Delete order
   */
  deleteOrder(id: number) {
    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this.showDeleteModal = false;
        // Reload orders with current filters
        if (this.hasActiveFilters()) {
          this.applyFilters();
        } else {
          this.getAllOrders();
        }
      },
      error: (error) => {
        console.error('Error deleting order:', error);
        this.showDeleteModal = false;
      }
    });    
  }
  
  /**
   * Get CSS class for status badge
   */
  getStatusClass(status: string): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'pending',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    
    return statusMap[status.toLowerCase()] || 'pending';
  }
  
  /**
   * Get display text for order status
   */
  getStatusText(status: string): string {
    return this.orderService.getStatusText(status);
  }
  
  /**
   * Get display text for payment method
   */
  getPaymentMethodText(method: string): string {
    if (!method) return 'Không xác định';
    
    const methodMap: {[key: string]: string} = {
      'cod': 'Tiền mặt',
      'vnpay': 'VNPay',
    };
    
    return methodMap[method.toLowerCase()] || method;
  }
}