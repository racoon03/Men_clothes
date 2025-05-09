
import { Component, OnInit } from '@angular/core';
import { CouponService } from 'src/app/services/coupon.service';
import { CouponResponse } from 'src/app/components/responses/coupon/coupon.response';
import { CouponDTO } from 'src/app/dtos/coupon/coupon.dto';
import { CategoryService } from 'src/app/services/category.service';
import { CouponListResponse } from 'src/app/components/responses/coupon/coupon.list.response';

@Component({
    selector: 'app-coupon-admin',
    templateUrl: './coupon.admin.component.html',
    styleUrls: ['./coupon.admin.component.scss']
})
export class CouponAdminComponent implements OnInit {
    // Danh sách coupon
    coupons: CouponResponse[] = [];
  
    // Biến phân trang
    currentPage: number = 1;
    totalPages: number = 0;
    totalCoupons: number = 0;
    limit: number = 8;
  
    // Biến tìm kiếm
    keyword: string = '';
  
    // Danh sách danh mục
    categories: any[] = [];
  
    // Coupon mới
    newCoupon: CouponDTO = {
        content: '',
        codeCp: '',
        discount: 0,
        category_id: 0,
        startday: '',
        endday: ''
    };
  
    // Biến để hiển thị form thêm mới
    showAddForm: boolean = false;
  
    // Modal xác nhận xóa
    showDeleteModal: boolean = false;
    couponToDelete: CouponResponse | null = null;
  
    // Modal gia hạn
    showExtendModalFlag: boolean = false;
    couponToExtend: CouponResponse | null = null;
    newEndDate: string = '';
  
    // Biến loading và thông báo
    isLoading: boolean = false;
    isSubmitting: boolean = false;
    showToast: boolean = false;
    toastMessage: string = '';
    toastType: 'success' | 'error' = 'success';
    toastTimeout: any;
  
    constructor(
        private couponService: CouponService,
        private categoryService: CategoryService
    ) { }

    ngOnInit(): void {
        this.loadCoupons();
        this.loadCategories();
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
    /**
     * Lấy số lượng coupon đã hết hạn
     */
    getExpiredCouponsCount(): number {
        return this.coupons.filter(coupon => this.isExpired(coupon)).length;
    }
  
    /**
     * Kiểm tra coupon đã hết hạn chưa
     */
    isExpired(coupon: CouponResponse): boolean {
        const now = new Date();
        let endDate: Date;
        
        if (Array.isArray(coupon.endday)) {
            const [year, month, day, hour, minute] = coupon.endday;
            endDate = new Date(year, month - 1, day, hour, minute);
        } else {
            endDate = new Date(coupon.endday);
        }
        
        return endDate < now;
    }
  
    /**
     * Format ngày tháng thành định dạng dễ đọc
     */
    formatDate(dateInput: string | any[] | undefined): string {
        if (!dateInput) return 'N/A';
        
        let date: Date;
        
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour, minute] = dateInput;
            date = new Date(year, month - 1, day, hour, minute);
        } else {
            date = new Date(dateInput);
        }
        
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
  
    /**
     * Tải danh sách coupon
     */
    loadCoupons(): void {
        this.isLoading = true;

        this.couponService.getCoupons(this.currentPage, this.limit, this.keyword).subscribe({
            next: (response: CouponListResponse) => {
            // Xử lý định dạng ngày cho mỗi coupon
            this.coupons = response.coupons.map(coupon => {
                // Tạo một bản sao để không ảnh hưởng đến dữ liệu gốc
                const formattedCoupon = {...coupon};
                
                // Chuyển đổi các trường ngày nếu chúng là mảng
                if (Array.isArray(formattedCoupon.startday)) {
                formattedCoupon.startday = this.convertArrayToDateString(formattedCoupon.startday as any);
                }
                
                if (Array.isArray(formattedCoupon.endday)) {
                formattedCoupon.endday = this.convertArrayToDateString(formattedCoupon.endday as any);
                }
                
                return formattedCoupon;
            });
            
            this.totalPages = response.total_pages;
            this.totalCoupons = response.coupons.length * response.total_pages;
            
            // Đảm bảo trang hiện tại không vượt quá tổng số trang
            if (this.currentPage > this.totalPages && this.totalPages > 0) {
                this.currentPage = 1;
                this.loadCoupons(); // Tải lại với trang 1
                return;
            }
            
            this.isLoading = false;
            },
            error: (error) => {
            console.error('Lỗi khi tải danh sách coupon:', error);
            this.showToastMessage('Đã xảy ra lỗi khi tải danh sách coupon', 'error');
            this.isLoading = false;
            }
        });
        }    
  
    /**
     * Tìm kiếm coupon
     */
    searchCoupons(): void {
        this.currentPage = 1; // Reset về trang đầu tiên khi tìm kiếm
        this.loadCoupons();
    }
  
    /**
     * Xóa từ khóa tìm kiếm
     */
    clearSearch(): void {
        this.keyword = '';
        this.currentPage = 1;
        this.loadCoupons();
    }
  
    /**
     * Chuyển đến trang được chọn
     */
    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadCoupons();
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
     * Hiển thị/ẩn form thêm mới coupon
     */
    toggleAddCouponForm(): void {
        this.showAddForm = !this.showAddForm;
    
        // Reset form khi hiển thị
        if (this.showAddForm) {
            this.resetCouponForm();
        }
    }
  
    /**
     * Reset form thêm mới coupon
     */
    resetCouponForm(): void {
        this.newCoupon = {
            content: '',
            codeCp: '',
            discount: 0,
            category_id: 0,
            startday: '',
            endday: ''
        };
    }
  
    /**
     * Tạo mới coupon
     */
    createCoupon(): void {
        this.isSubmitting = true;
    
        this.couponService.createCoupon(this.newCoupon).subscribe({
            next: (response) => {
                this.showToastMessage('Thêm mã giảm giá thành công', 'success');
                this.toggleAddCouponForm(); // Ẩn form
                this.loadCoupons(); // Tải lại danh sách
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Lỗi khi tạo mã giảm giá:', error);
                this.showToastMessage('Đã xảy ra lỗi khi tạo mã giảm giá', 'error');
                this.isSubmitting = false;
            }
        });
    }
  
    /**
     * Hiển thị modal xác nhận xóa
     */
    showDeleteConfirmModal(coupon: CouponResponse): void {
        this.couponToDelete = coupon;
        this.showDeleteModal = true;
    }
  
    /**
     * Hủy xóa coupon
     */
    cancelDelete(): void {
        this.showDeleteModal = false;
        this.couponToDelete = null;
    }
  
    /**
     * Xác nhận xóa coupon
     */
    confirmDelete(): void {
        if (!this.couponToDelete) return;
    
        this.isLoading = true;
    
        this.couponService.deleteCoupon(this.couponToDelete.id).subscribe({
            next: () => {
                this.showToastMessage(`Đã xóa mã giảm giá "${this.couponToDelete?.codecp}" thành công`, 'success');
                this.loadCoupons(); // Tải lại danh sách
                this.cancelDelete(); // Đóng modal
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Lỗi khi xóa mã giảm giá:', error);
                this.showToastMessage('Đã xảy ra lỗi khi xóa mã giảm giá', 'error');
                this.isLoading = false;
            }
        });
    }
  
    /**
     * Hiển thị modal gia hạn
     */
    showExtendModal(coupon: CouponResponse): void {
        this.couponToExtend = {...coupon};
        
        // Nếu endday là mảng, chuyển đổi thành chuỗi
        if (Array.isArray(this.couponToExtend.endday)) {
            this.couponToExtend.endday = this.convertArrayToDateString(this.couponToExtend.endday as any);
        }
        
        // Đặt ngày mới mặc định là 7 ngày sau ngày hiện tại
        const now = new Date();
        now.setDate(now.getDate() + 7);
        this.newEndDate = now.toISOString().slice(0, 16); // Format cho input datetime-local
        
        this.showExtendModalFlag = true;
    }
  
    /**
     * Hủy gia hạn
     */
    cancelExtend(): void {
        this.showExtendModalFlag = false;
        this.couponToExtend = null;
        this.newEndDate = '';
    }
  
    /**
     * Xác nhận gia hạn
     */
    confirmExtend(): void {
        if (!this.couponToExtend || !this.newEndDate) return;
    
        this.isSubmitting = true;
    
        this.couponService.extendCoupon(this.couponToExtend.id, this.newEndDate).subscribe({
            next: (response) => {
                // Cập nhật coupon trong danh sách
                const index = this.coupons.findIndex(c => c.id === response.id);
                if (index !== -1) {
                    this.coupons[index] = response;
                }
        
                this.showToastMessage(`Đã gia hạn mã giảm giá "${this.couponToExtend?.codecp}" thành công`, 'success');
                this.cancelExtend(); // Đóng modal
                this.isSubmitting = false;
            },
            error: (error) => {
                console.error('Lỗi khi gia hạn mã giảm giá:', error);
                this.showToastMessage('Đã xảy ra lỗi khi gia hạn mã giảm giá', 'error');
                this.isSubmitting = false;
            }
        });
    }
  
    /**
     * Lấy danh sách danh mục sản phẩm
     */
    loadCategories(): void {
        this.isLoading = true;
    
        this.categoryService.getAllCategories().subscribe({
            next: (response) => {
                this.categories = response;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Lỗi khi tải danh sách danh mục:', error);
                this.showToastMessage('Đã xảy ra lỗi khi tải danh sách danh mục', 'error');
                this.isLoading = false;
            }
        });
    }
  
    /**
     * Lấy tên danh mục dựa vào id
     */
    getCategoryName(categoryId: number): string {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : 'Không xác định';
    }
  
    /**
     * Lấy số lượng coupon đang hoạt động
     */
    getActiveCouponsCount(): number {
        return this.coupons.filter(coupon => !this.isExpired(coupon)).length;
    }

    /**
 * Chuyển đổi mảng ngày [năm, tháng, ngày, giờ, phút] thành chuỗi định dạng ISO
 */
  /**
 * Chuyển đổi mảng ngày [năm, tháng, ngày, giờ, phút] thành chuỗi định dạng ISO
 */
    convertArrayToDateString(dateArray: any[]): string {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 5) {
            return '';
        }
        
        const [year, month, day, hour, minute] = dateArray;
        // JavaScript sử dụng tháng 0-11, nhưng mảng của bạn có vẻ như sử dụng 1-12, nên giảm đi 1
        const date = new Date(year, month - 1, day, hour, minute);
        
        // Định dạng thành chuỗi YYYY-MM-DDThh:mm cần thiết cho input datetime-local
        return date.toISOString().slice(0, 16);
    }

}