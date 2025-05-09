package com.project.shopapp.services;
import com.project.shopapp.dtos.DateFilterDTO;

import java.util.Map;

public interface IDashboardService {
    /**
     * Lấy thống kê lợi nhuận theo khoảng thời gian
     * @param dateFilter Khoảng thời gian
     * @return Dữ liệu thống kê
     */
    Map<String, Object> getProfitStatistics(DateFilterDTO dateFilter);

    /**
     * Tính toán lợi nhuận theo đơn vị thời gian
     * @param dateFilter Khoảng thời gian
     * @param timeUnit Đơn vị thời gian (day, week, month, quarter, year)
     * @return Dữ liệu thống kê theo đơn vị thời gian
     */
    Map<String, Object> calculateProfitByTimeUnit(DateFilterDTO dateFilter, String timeUnit);

    /**
     * Xuất báo cáo lợi nhuận ra file Excel
     * @param dateFilter Khoảng thời gian
     * @return Mảng byte của file Excel
     */
    byte[] exportProfitReport(DateFilterDTO dateFilter);
}
