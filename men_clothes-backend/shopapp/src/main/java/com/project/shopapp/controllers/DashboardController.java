package com.project.shopapp.controllers;

import com.project.shopapp.dtos.DateFilterDTO;
import com.project.shopapp.services.IDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final IDashboardService dashboardService;

    /**
     * Lấy thống kê lợi nhuận theo khoảng thời gian
     */
    @GetMapping("/profit")
    public ResponseEntity<Map<String, Object>> getProfitStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        DateFilterDTO dateFilter = createDateFilter(startDate, endDate);
        Map<String, Object> result = dashboardService.getProfitStatistics(dateFilter);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy dữ liệu lợi nhuận theo đơn vị thời gian
     */
    @GetMapping("/profit/{timeUnit}")
    public ResponseEntity<Map<String, Object>> getProfitByTimeUnit(
            @PathVariable String timeUnit,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        DateFilterDTO dateFilter = createDateFilter(startDate, endDate);
        Map<String, Object> result = dashboardService.calculateProfitByTimeUnit(dateFilter, timeUnit);
        return ResponseEntity.ok(result);
    }

    /**
     * Xuất báo cáo dạng Excel
     */
    @GetMapping("/export/profit")
    public ResponseEntity<Resource> exportProfitReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        DateFilterDTO dateFilter = createDateFilter(startDate, endDate);

        String filename = "profit-report_" +
                dateFilter.getStartDate().format(DateTimeFormatter.ISO_DATE) + "_to_" +
                dateFilter.getEndDate().format(DateTimeFormatter.ISO_DATE) + ".xlsx";

        byte[] excelBytes = dashboardService.exportProfitReport(dateFilter);
        ByteArrayResource resource = new ByteArrayResource(excelBytes);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
//        headers.add("Access-Control-Allow-Origin", "http://localhost:4200");
//        headers.add("Access-Control-Allow-Methods", "GET, OPTIONS");
//        headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization");
//        headers.add("Access-Control-Expose-Headers", "Content-Disposition");
//        headers.add("Access-Control-Allow-Credentials", "true");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .contentLength(excelBytes.length)
                .body(resource);
    }

    /**
     * Phương thức tiện ích để tạo đối tượng DateFilterDTO từ chuỗi ngày
     */
    private DateFilterDTO createDateFilter(String startDateStr, String endDateStr) {
        DateFilterDTO dateFilter = new DateFilterDTO();

        // Chuyển đổi chuỗi ngày thành đối tượng LocalDate nếu có
        if (startDateStr != null && !startDateStr.isEmpty()) {
            dateFilter.setStartDate(LocalDate.parse(startDateStr));
        }

        if (endDateStr != null && !endDateStr.isEmpty()) {
            dateFilter.setEndDate(LocalDate.parse(endDateStr));
        }

        // Thiết lập giá trị mặc định nếu cần
        dateFilter.setDefaultValues();

        return dateFilter;
    }
}