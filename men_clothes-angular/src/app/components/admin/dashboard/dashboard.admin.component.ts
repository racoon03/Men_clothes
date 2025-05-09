import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard.admin.component.html',
  styleUrls: ['./dashboard.admin.component.scss'],
  providers: [DatePipe]
})
export class DashboardAdminComponent implements OnInit, OnDestroy, AfterViewInit {
  // Charts
  private profitTrendChart: Chart | null = null;
  private revenueExpenseChart: Chart | null = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  // Date filters
  startDate: string = '';
  endDate: string = '';
  minEndDate: string = '';
  maxStartDate: string = '';

  // Loading state
  isLoading: boolean = false;

  // Time unit options
  selectedTimeUnit: string = 'day';
  timeUnitOptions = [
    { value: 'day', label: 'Ngày' },
    { value: 'week', label: 'Tuần' },
    { value: 'month', label: 'Tháng' },
    { value: 'quarter', label: 'Quý' },
  ];

  // Data
  profitStats: any = {
    totalRevenue: 0,
    totalCost: 0,
    profit: 0
  };
  profitData: any[] = [];
  
  // Previous period comparison
  isPositiveRevenue: boolean = true;
  isPositiveCost: boolean = false;
  isPositiveProfit: boolean = true;
  isPositiveMargin: boolean = true;
  revenueChange: number = 0;
  costChange: number = 0;
  profitChange: number = 0;
  marginChange: number = 0;
  profitMargin: number = 0;

  constructor(
    private dashboardService: DashboardService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    // Initialize dates
    this.initializeDates();
    
    // Load initial data
    this.loadData();
  }
  
  ngAfterViewInit(): void {
    // Initialize charts after view is initialized
    setTimeout(() => {
      this.initCharts();
    }, 500);
  }

  ngOnDestroy(): void {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Destroy charts to prevent memory leaks
    if (this.profitTrendChart) {
      this.profitTrendChart.destroy();
    }
    if (this.revenueExpenseChart) {
      this.revenueExpenseChart.destroy();
    }
  }

  /**
   * Initialize default date values
   */
  initializeDates(): void {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    this.endDate = this.formatDateForInput(today);
    this.startDate = this.formatDateForInput(thirtyDaysAgo);
    this.maxStartDate = this.endDate;
    this.minEndDate = this.startDate;
  }

  /**
   * Format date for input element
   */
  formatDateForInput(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  /**
   * Handle date change
   */
  onDateChange(): void {
    this.minEndDate = this.startDate;
    this.maxStartDate = this.endDate;
    this.loadData();
  }

  /**
   * Set date range based on preset
   */
  setDateRange(preset: string): void {
    const today = new Date();
    let startDate = new Date();
    
    switch (preset) {
      case 'today':
        startDate = new Date(today);
        break;
      case 'week':
        // Set to beginning of current week (Monday)
        const dayOfWeek = today.getDay() || 7; // Make Sunday = 7
        startDate.setDate(today.getDate() - dayOfWeek + 1); // Start from Monday
        break;
      case 'month':
        // Set to beginning of current month
        startDate.setDate(1);
        break;
      case 'year':
        // Set to beginning of current year
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }
    
    this.startDate = this.formatDateForInput(startDate);
    this.endDate = this.formatDateForInput(today);
    this.minEndDate = this.startDate;
    this.maxStartDate = this.endDate;
    this.loadData();
  }

  /**
   * Load profit data
   */
  loadData(): void {
    this.isLoading = true;
    
    // Load main profit statistics
    const profitSub = this.dashboardService.getProfitStatistics(this.startDate, this.endDate)
      .subscribe({
        next: (response) => {
          this.profitStats = response;
          
          // Calculate profit margin
          this.profitMargin = this.profitStats.totalRevenue > 0 
            ? this.profitStats.profit / this.profitStats.totalRevenue 
            : 0;
          
          // Calculate comparison with previous period
          this.calculateComparison();
          
          // Load profit data by time unit
          this.loadProfitByTimeUnit();
        },
        error: (error) => {
          console.error('Error loading profit statistics:', error);
          this.isLoading = false;
        }
      });
    
    this.subscriptions.push(profitSub);
  }

  /**
   * Load profit data by time unit
   */
  loadProfitByTimeUnit(): void {
    const timeUnitSub = this.dashboardService.getProfitByTimeUnit(
      this.selectedTimeUnit, 
      this.startDate, 
      this.endDate
    ).subscribe({
      next: (response) => {
        // Store profit data
        this.profitData = response.data || [];
        
        // Init charts
        this.initCharts();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error(`Error loading profit data by ${this.selectedTimeUnit}:`, error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(timeUnitSub);
  }
  
  /**
   * Change time unit for data visualization
   */
  changeTimeUnit(unit: string): void {
    if (this.selectedTimeUnit !== unit) {
      this.selectedTimeUnit = unit;
      this.isLoading = true;
      this.loadProfitByTimeUnit();
    }
  }
  
  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(prevValue: number, currentValue: number): number {
    if (prevValue === 0) {
      return currentValue > 0 ? 100 : 0;
    }
    
    return Number(((currentValue - prevValue) / Math.abs(prevValue) * 100).toFixed(1));
  }
  
  /**
   * Initialize chart objects
   */
  initCharts(): void {
    // Destroy existing charts to prevent memory leaks
    if (this.profitTrendChart) {
      this.profitTrendChart.destroy();
    }
    if (this.revenueExpenseChart) {
      this.revenueExpenseChart.destroy();
    }
    
    // Initialize profit trend chart
    this.initProfitTrendChart();
    
    // Initialize revenue vs expense chart
    this.initRevenueExpenseChart();
  }
  
  /**
   * Initialize profit trend chart
   */
  private initProfitTrendChart(): void {
    const canvas = document.getElementById('profitTrendChart') as HTMLCanvasElement;
    if (!canvas || !this.profitData.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const labels = this.profitData.map(item => this.formatPeriodLabel(item.period));
    const profits = this.profitData.map(item => item.profit);
    
    this.profitTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Lợi nhuận',
          data: profits,
          fill: true,
          backgroundColor: 'rgba(28, 200, 138, 0.1)',
          borderColor: 'rgba(28, 200, 138, 1)',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: 'rgba(28, 200, 138, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(value as number);
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(context.parsed.y);
                return label;
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    });
  }
  
  /**
   * Initialize revenue vs expense chart
   */
  private initRevenueExpenseChart(): void {
    const canvas = document.getElementById('revenueExpenseChart') as HTMLCanvasElement;
    if (!canvas || !this.profitData.length) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const labels = this.profitData.map(item => this.formatPeriodLabel(item.period));
    const revenues = this.profitData.map(item => item.revenue);
    const expenses = this.profitData.map(item => item.cost);
    
    this.revenueExpenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Doanh thu',
            data: revenues,
            backgroundColor: 'rgba(78, 115, 223, 0.8)',
            borderColor: 'rgba(78, 115, 223, 1)',
            borderWidth: 1,
          },
          {
            label: 'Chi phí',
            data: expenses,
            backgroundColor: 'rgba(231, 74, 59, 0.8)',
            borderColor: 'rgba(231, 74, 59, 1)',
            borderWidth: 1,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(value as number);
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  maximumFractionDigits: 0
                }).format(context.parsed.y);
                return label;
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Format period label based on time unit
   */
  formatPeriodLabel(period: string): string {
    if (!period) return '';
    
    switch (this.selectedTimeUnit) {
      case 'day':
        // Format: yyyy-MM-dd -> dd/MM
        const dateParts = period.split('-');
        if (dateParts.length === 3) {
          return `${dateParts[2]}/${dateParts[1]}`;
        }
        return period;
        
      case 'week':
        // Format: yyyy-Wxx -> Tuần xx
        if (period.includes('-W')) {
          return `Tuần ${period.split('-W')[1]}`;
        }
        return period;
        
      case 'month':
        // Format: yyyy-MM -> MM/yyyy
        const monthParts = period.split('-');
        if (monthParts.length === 2) {
          return `${monthParts[1]}/${monthParts[0]}`;
        }
        return period;
        
      case 'quarter':
        // Format: yyyy-Qx -> Quý x/yyyy
        if (period.includes('-Q')) {
          const parts = period.split('-Q');
          return `Quý ${parts[1]}/${parts[0]}`;
        }
        return period;
        
      default:
        return period;
    }
  }
  
  /**
   * Get label for selected time unit
   */
  getTimeUnitLabel(): string {
    const unitMap: {[key: string]: string} = {
      'day': 'Ngày',
      'week': 'Tuần',
      'month': 'Tháng',
      'quarter': 'Quý',
      'year': 'Năm'
    };
    
    return unitMap[this.selectedTimeUnit] || 'Khoảng thời gian';
  }
  
  /**
   * Export profit report as Excel file
   */
  exportReport(): void {
    this.isLoading = true;
    
    this.dashboardService.exportProfitReport(this.startDate, this.endDate)
      .subscribe({
        next: (blob: Blob) => {
          // Create a URL for the blob
          const url = window.URL.createObjectURL(blob);
          
          // Create a link and click it to trigger download
          const a = document.createElement('a');
          const filename = `bao-cao-loi-nhuan_${this.startDate}_${this.endDate}.xlsx`;
          
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error exporting report:', error);
          this.isLoading = false;
          alert('Có lỗi khi xuất báo cáo. Vui lòng thử lại sau.');
        }
      });
  }

  /**
   * Calculate comparison with previous period
   */
  calculateComparison(): void {
    // Calculate date range for previous period
    const currentStartDate = new Date(this.startDate);
    const currentEndDate = new Date(this.endDate);
    
    const diffDays = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const prevEndDate = new Date(currentStartDate);
    prevEndDate.setDate(prevEndDate.getDate() - 1);
    
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - diffDays + 1);
    
    const prevStartDateStr = this.formatDateForInput(prevStartDate);
    const prevEndDateStr = this.formatDateForInput(prevEndDate);
    
    // Get profit statistics for previous period
    const comparisonSub = this.dashboardService.getProfitStatistics(prevStartDateStr, prevEndDateStr)
      .subscribe({
        next: (prevStats) => {
          // Calculate percentage changes
          this.revenueChange = this.calculatePercentageChange(
            prevStats.totalRevenue, 
            this.profitStats.totalRevenue
          );
          
          this.costChange = this.calculatePercentageChange(
            prevStats.totalCost, 
            this.profitStats.totalCost
          );
          
          this.profitChange = this.calculatePercentageChange(
            prevStats.profit, 
            this.profitStats.profit
          );
          
          // Calculate previous profit margin
          const prevProfitMargin = prevStats.totalRevenue > 0 
            ? prevStats.profit / prevStats.totalRevenue 
            : 0;
          
          // Calculate margin change in percentage points
          this.marginChange = Number(((this.profitMargin - prevProfitMargin) * 100).toFixed(1));
          
          // Set direction indicators
          this.isPositiveRevenue = this.revenueChange >= 0;
          this.isPositiveCost = this.costChange >= 0;
          this.isPositiveProfit = this.profitChange >= 0;
          this.isPositiveMargin = this.marginChange >= 0;
        },
        error: (error) => {
          console.error('Error loading comparison data:', error);
          
          // Set default values
          this.revenueChange = 0;
          this.costChange = 0;
          this.profitChange = 0;
          this.marginChange = 0;
        }
      });
    
    this.subscriptions.push(comparisonSub);
  }

  printOrder(): void {
    window.print();
  }
}