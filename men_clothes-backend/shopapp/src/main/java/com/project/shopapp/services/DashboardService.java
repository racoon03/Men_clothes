package com.project.shopapp.services;

import com.project.shopapp.dtos.DateFilterDTO;
import com.project.shopapp.models.*;
import com.project.shopapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService implements IDashboardService {
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final StockImportHistoryRepository stockImportHistoryRepository;

    /**
     * Lấy thống kê lợi nhuận theo khoảng thời gian
     * @param dateFilter Khoảng thời gian cần thống kê
     * @return Dữ liệu thống kê
     */
    @Override
    public Map<String, Object> getProfitStatistics(DateFilterDTO dateFilter) {
        if (dateFilter == null) {
            dateFilter = new DateFilterDTO();
            // Mặc định là thiết lập thời gian cho ngày hiện tại
            dateFilter.setStartDate(LocalDate.now());
            dateFilter.setEndDate(LocalDate.now());
        }

        if (!dateFilter.isValid()) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        LocalDateTime startDateTime = dateFilter.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = dateFilter.getEndDate().atTime(LocalTime.MAX);

        // Lấy doanh thu (từ đơn hàng đã giao)
        List<Order> orders = orderRepository.findByOrderDateBetween(
                        dateFilter.getStartDate(),
                        dateFilter.getEndDate()
                ).stream()
                .filter(order -> "delivered".equalsIgnoreCase(order.getStatus()))
                .collect(Collectors.toList());

        // Tính tổng doanh thu
        float totalRevenue = 0f;
        for (Order order : orders) {
            totalRevenue += order.getTotalMoney();
        }

        // Tính tổng chi phí nhập hàng
        Float totalCost = stockImportHistoryRepository.calculateTotalImportCost(startDateTime, endDateTime);
        if (totalCost == null) totalCost = 0f;

        // Tính lợi nhuận
        float profit = totalRevenue - totalCost;

        // Tạo kết quả trả về
        Map<String, Object> result = new HashMap<>();
        result.put("startDate", dateFilter.getStartDate());
        result.put("endDate", dateFilter.getEndDate());
        result.put("totalRevenue", totalRevenue);
        result.put("totalCost", totalCost);
        result.put("profit", profit);

        // Lấy dữ liệu lợi nhuận theo thời gian
        result.put("profitByTime", getProfitDataByTime(dateFilter));

        return result;
    }

    /**
     * Lấy dữ liệu lợi nhuận theo các mốc thời gian: hôm nay, tuần này, tháng này, năm này
     * @param dateFilter Khoảng thời gian cần thống kê
     * @return Dữ liệu thống kê theo thời gian
     */
    private Map<String, Object> getProfitDataByTime(DateFilterDTO dateFilter) {
        Map<String, Object> result = new HashMap<>();

        // Lấy ngày hiện tại
        LocalDate today = LocalDate.now();

        // 1. Thống kê hôm nay
        DateFilterDTO todayFilter = new DateFilterDTO();
        todayFilter.setStartDate(today);
        todayFilter.setEndDate(today);
        result.put("today", calculateProfitForPeriod(todayFilter));

        // 2. Thống kê tuần này
        DateFilterDTO weekFilter = new DateFilterDTO();
        LocalDate startOfWeek = today.minusDays(today.getDayOfWeek().getValue() - 1);
        weekFilter.setStartDate(startOfWeek);
        weekFilter.setEndDate(today);
        result.put("thisWeek", calculateProfitForPeriod(weekFilter));

        // 3. Thống kê tháng này
        DateFilterDTO monthFilter = new DateFilterDTO();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        monthFilter.setStartDate(startOfMonth);
        monthFilter.setEndDate(today);
        result.put("thisMonth", calculateProfitForPeriod(monthFilter));

        // 4. Thống kê năm này
        DateFilterDTO yearFilter = new DateFilterDTO();
        LocalDate startOfYear = today.withDayOfYear(1);
        yearFilter.setStartDate(startOfYear);
        yearFilter.setEndDate(today);
        result.put("thisYear", calculateProfitForPeriod(yearFilter));

        // 5. Thống kê theo khoảng thời gian được chọn
        result.put("selectedPeriod", calculateProfitByTimeUnit(dateFilter, "day"));

        return result;
    }

    /**
     * Tính toán lợi nhuận cho một khoảng thời gian
     * @param dateFilter Khoảng thời gian
     * @return Dữ liệu tổng hợp
     */
    private Map<String, Object> calculateProfitForPeriod(DateFilterDTO dateFilter) {
        LocalDateTime startDateTime = dateFilter.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = dateFilter.getEndDate().atTime(LocalTime.MAX);

        // Lấy đơn hàng
        List<Order> orders = orderRepository.findByOrderDateBetween(
                        dateFilter.getStartDate(),
                        dateFilter.getEndDate()
                ).stream()
                .filter(order -> "delivered".equalsIgnoreCase(order.getStatus()))
                .collect(Collectors.toList());

        // Tính doanh thu
        float revenue = 0f;
        for (Order order : orders) {
            revenue += order.getTotalMoney();
        }

        // Tính chi phí
        Float cost = stockImportHistoryRepository.calculateTotalImportCost(startDateTime, endDateTime);
        if (cost == null) cost = 0f;

        // Tính lợi nhuận
        float profit = revenue - cost;

        Map<String, Object> result = new HashMap<>();
        result.put("startDate", dateFilter.getStartDate());
        result.put("endDate", dateFilter.getEndDate());
        result.put("revenue", revenue);
        result.put("cost", cost);
        result.put("profit", profit);

        return result;
    }

    /**
     * Tính toán lợi nhuận theo đơn vị thời gian (ngày, tuần, tháng, quý, năm)
     * @param dateFilter Khoảng thời gian
     * @param timeUnit Đơn vị thời gian (day, week, month, quarter, year)
     * @return Danh sách kết quả theo đơn vị thời gian
     */
    @Override
    public Map<String, Object> calculateProfitByTimeUnit(DateFilterDTO dateFilter, String timeUnit) {
        if (dateFilter == null) {
            dateFilter = new DateFilterDTO();
            dateFilter.setStartDate(LocalDate.now());
            dateFilter.setEndDate(LocalDate.now());
        }

        dateFilter.setDefaultValues();
        if (!dateFilter.isValid()) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        LocalDateTime startDateTime = dateFilter.getStartDate().atStartOfDay();
        LocalDateTime endDateTime = dateFilter.getEndDate().atTime(LocalTime.MAX);

        // Lấy tất cả đơn hàng đã giao trong khoảng thời gian
        List<Order> orders = orderRepository.findByOrderDateBetween(
                        dateFilter.getStartDate(),
                        dateFilter.getEndDate()
                ).stream()
                .filter(order -> "delivered".equalsIgnoreCase(order.getStatus()))
                .collect(Collectors.toList());

        // Lấy tất cả lịch sử nhập hàng trong khoảng thời gian
        List<StockImportHistory> importHistory = stockImportHistoryRepository
                .findByImportDateBetweenOrderByImportDateDesc(startDateTime, endDateTime);

        // Tính toán doanh thu và chi phí theo đơn vị thời gian
        Map<String, Float> revenueByPeriod = new HashMap<>();
        Map<String, Float> costByPeriod = new HashMap<>();
        DateTimeFormatter formatter;

        // Nhóm theo đơn vị thời gian khác nhau
        switch (timeUnit.toLowerCase()) {
            case "day":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                // Tính doanh thu theo ngày
                for (Order order : orders) {
                    String day = order.getOrderDate().format(formatter);
                    revenueByPeriod.put(day, revenueByPeriod.getOrDefault(day, 0f) + order.getTotalMoney());
                }

                // Tính chi phí theo ngày
                for (StockImportHistory importItem : importHistory) {
                    String day = importItem.getImportDate().toLocalDate().format(formatter);
                    float itemCost = importItem.getImportPrice() * importItem.getQuantity();
                    costByPeriod.put(day, costByPeriod.getOrDefault(day, 0f) + itemCost);
                }
                break;
            case "week":
                // Nhóm theo tuần ISO (1-52)
                for (Order order : orders) {
                    int weekNumber = order.getOrderDate().get(java.time.temporal.WeekFields.ISO.weekOfYear());
                    String weekKey = order.getOrderDate().getYear() + "-W" + weekNumber;
                    revenueByPeriod.put(weekKey, revenueByPeriod.getOrDefault(weekKey, 0f) + order.getTotalMoney());
                }

                // Tính chi phí theo tuần
                for (StockImportHistory importItem : importHistory) {
                    LocalDate importDate = importItem.getImportDate().toLocalDate();
                    int weekNumber = importDate.get(java.time.temporal.WeekFields.ISO.weekOfYear());
                    String weekKey = importDate.getYear() + "-W" + weekNumber;
                    float itemCost = importItem.getImportPrice() * importItem.getQuantity();
                    costByPeriod.put(weekKey, costByPeriod.getOrDefault(weekKey, 0f) + itemCost);
                }
                break;
            case "month":
                formatter = DateTimeFormatter.ofPattern("yyyy-MM");
                // Tính doanh thu theo tháng
                for (Order order : orders) {
                    String month = order.getOrderDate().format(formatter);
                    revenueByPeriod.put(month, revenueByPeriod.getOrDefault(month, 0f) + order.getTotalMoney());
                }

                // Tính chi phí theo tháng
                for (StockImportHistory importItem : importHistory) {
                    String month = importItem.getImportDate().format(formatter);
                    float itemCost = importItem.getImportPrice() * importItem.getQuantity();
                    costByPeriod.put(month, costByPeriod.getOrDefault(month, 0f) + itemCost);
                }
                break;
            case "quarter":
                // Tính doanh thu theo quý
                for (Order order : orders) {
                    int quarter = (order.getOrderDate().getMonthValue() - 1) / 3 + 1;
                    String quarterKey = order.getOrderDate().getYear() + "-Q" + quarter;
                    revenueByPeriod.put(quarterKey, revenueByPeriod.getOrDefault(quarterKey, 0f) + order.getTotalMoney());
                }

                // Tính chi phí theo quý
                for (StockImportHistory importItem : importHistory) {
                    LocalDate importDate = importItem.getImportDate().toLocalDate();
                    int quarter = (importDate.getMonthValue() - 1) / 3 + 1;
                    String quarterKey = importDate.getYear() + "-Q" + quarter;
                    float itemCost = importItem.getImportPrice() * importItem.getQuantity();
                    costByPeriod.put(quarterKey, costByPeriod.getOrDefault(quarterKey, 0f) + itemCost);
                }
                break;
            case "year":
                // Tính doanh thu theo năm
                for (Order order : orders) {
                    String year = String.valueOf(order.getOrderDate().getYear());
                    revenueByPeriod.put(year, revenueByPeriod.getOrDefault(year, 0f) + order.getTotalMoney());
                }

                // Tính chi phí theo năm
                for (StockImportHistory importItem : importHistory) {
                    String year = String.valueOf(importItem.getImportDate().getYear());
                    float itemCost = importItem.getImportPrice() * importItem.getQuantity();
                    costByPeriod.put(year, costByPeriod.getOrDefault(year, 0f) + itemCost);
                }
                break;
            default:
                throw new IllegalArgumentException("Đơn vị thời gian không hợp lệ: " + timeUnit);
        }

        // Tạo dữ liệu lợi nhuận
        Set<String> allPeriods = new HashSet<>();
        allPeriods.addAll(revenueByPeriod.keySet());
        allPeriods.addAll(costByPeriod.keySet());

        List<Map<String, Object>> profitData = new ArrayList<>();
        for (String period : allPeriods) {
            float revenue = revenueByPeriod.getOrDefault(period, 0f);
            float cost = costByPeriod.getOrDefault(period, 0f);
            float profit = revenue - cost;

            Map<String, Object> item = new HashMap<>();
            item.put("period", period);
            item.put("revenue", revenue);
            item.put("cost", cost);
            item.put("profit", profit);
            profitData.add(item);
        }

        // Sắp xếp theo thời gian
        profitData.sort(Comparator.comparing(item -> (String) item.get("period")));

        Map<String, Object> result = new HashMap<>();
        result.put("timeUnit", timeUnit);
        result.put("data", profitData);
        result.put("totalRevenue", profitData.stream().mapToDouble(item -> ((Number) item.get("revenue")).doubleValue()).sum());
        result.put("totalCost", profitData.stream().mapToDouble(item -> ((Number) item.get("cost")).doubleValue()).sum());
        result.put("totalProfit", profitData.stream().mapToDouble(item -> ((Number) item.get("profit")).doubleValue()).sum());

        return result;
    }

    /**
     * Xuất báo cáo lợi nhuận ra file Excel
     * @param dateFilter Khoảng thời gian cần báo cáo
     * @return Mảng byte của file Excel
     */
    @Override
    public byte[] exportProfitReport(DateFilterDTO dateFilter) {
        if (dateFilter == null) {
            dateFilter = new DateFilterDTO();
            dateFilter.setStartDate(LocalDate.now().minusMonths(1));
            dateFilter.setEndDate(LocalDate.now());
        }

        if (!dateFilter.isValid()) {
            throw new IllegalArgumentException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        // Lấy dữ liệu thống kê
        Map<String, Object> profitStats = getProfitStatistics(dateFilter);
        Map<String, Object> dailyProfitData = calculateProfitByTimeUnit(dateFilter, "day");
        Map<String, Object> monthlyProfitData = calculateProfitByTimeUnit(dateFilter, "month");

        try {
            return generateExcelReport(profitStats, dailyProfitData, monthlyProfitData, dateFilter);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo báo cáo: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo file Excel báo cáo lợi nhuận
     */
    private byte[] generateExcelReport(
            Map<String, Object> profitStats,
            Map<String, Object> dailyProfitData,
            Map<String, Object> monthlyProfitData,
            DateFilterDTO dateFilter) throws Exception {

        try (Workbook workbook = new XSSFWorkbook()) {
            // Tạo các kiểu dáng
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setWrapText(true);

            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            currencyStyle.setDataFormat(format.getFormat("#,##0 VND"));

            CellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(format.getFormat("0.00%"));

            // 1. Tạo sheet tổng quan
            Sheet overviewSheet = workbook.createSheet("Tổng quan");
            overviewSheet.setColumnWidth(0, 5000);
            overviewSheet.setColumnWidth(1, 7000);

            // Thêm tiêu đề
            Row titleRow = overviewSheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Báo cáo lợi nhuận");
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            // Thêm khoảng thời gian
            Row dateRow = overviewSheet.createRow(1);
            dateRow.createCell(0).setCellValue("Thời gian:");
            dateRow.createCell(1).setCellValue(
                    dateFilter.getStartDate().toString() + " đến " + dateFilter.getEndDate().toString());

            // Thêm thống kê
            int rowNum = 3;
            Row headerRow = overviewSheet.createRow(rowNum++);
            headerRow.createCell(0).setCellValue("Chỉ số");
            headerRow.createCell(1).setCellValue("Giá trị");
            headerRow.getCell(0).setCellStyle(headerStyle);
            headerRow.getCell(1).setCellStyle(headerStyle);

            Row totalRevenueRow = overviewSheet.createRow(rowNum++);
            totalRevenueRow.createCell(0).setCellValue("Tổng doanh thu");
            Cell totalRevenueCell = totalRevenueRow.createCell(1);
            totalRevenueCell.setCellValue(((Number) profitStats.get("totalRevenue")).doubleValue());
            totalRevenueCell.setCellStyle(currencyStyle);

            Row totalCostRow = overviewSheet.createRow(rowNum++);
            totalCostRow.createCell(0).setCellValue("Tổng chi phí");
            Cell totalCostCell = totalCostRow.createCell(1);
            totalCostCell.setCellValue(((Number) profitStats.get("totalCost")).doubleValue());
            totalCostCell.setCellStyle(currencyStyle);

            Row profitRow = overviewSheet.createRow(rowNum++);
            profitRow.createCell(0).setCellValue("Lợi nhuận");
            Cell profitCell = profitRow.createCell(1);
            profitCell.setCellValue(((Number) profitStats.get("profit")).doubleValue());
            profitCell.setCellStyle(currencyStyle);

            // 2. Tạo sheet lợi nhuận theo ngày
            Sheet dailyProfitSheet = workbook.createSheet("Lợi nhuận theo ngày");
            dailyProfitSheet.setColumnWidth(0, 5000);
            dailyProfitSheet.setColumnWidth(1, 5000);
            dailyProfitSheet.setColumnWidth(2, 5000);
            dailyProfitSheet.setColumnWidth(3, 5000);

            Row dailyHeaderRow = dailyProfitSheet.createRow(0);
            dailyHeaderRow.createCell(0).setCellValue("Ngày");
            dailyHeaderRow.createCell(1).setCellValue("Doanh thu");
            dailyHeaderRow.createCell(2).setCellValue("Chi phí");
            dailyHeaderRow.createCell(3).setCellValue("Lợi nhuận");

            for (int i = 0; i < 4; i++) {
                dailyHeaderRow.getCell(i).setCellStyle(headerStyle);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> dailyData = (List<Map<String, Object>>) dailyProfitData.get("data");

            int dailyRowNum = 1;
            for (Map<String, Object> day : dailyData) {
                Row row = dailyProfitSheet.createRow(dailyRowNum++);
                row.createCell(0).setCellValue((String) day.get("period"));

                Cell revenueCell = row.createCell(1);
                revenueCell.setCellValue(((Number) day.get("revenue")).doubleValue());
                revenueCell.setCellStyle(currencyStyle);

                Cell costCell = row.createCell(2);
                costCell.setCellValue(((Number) day.get("cost")).doubleValue());
                costCell.setCellStyle(currencyStyle);

                Cell dayProfitCell = row.createCell(3);
                dayProfitCell.setCellValue(((Number) day.get("profit")).doubleValue());
                dayProfitCell.setCellStyle(currencyStyle);
            }

            // 3. Tạo sheet lợi nhuận theo tháng
            Sheet monthlyProfitSheet = workbook.createSheet("Lợi nhuận theo tháng");
            monthlyProfitSheet.setColumnWidth(0, 5000);
            monthlyProfitSheet.setColumnWidth(1, 5000);
            monthlyProfitSheet.setColumnWidth(2, 5000);
            monthlyProfitSheet.setColumnWidth(3, 5000);

            Row monthlyHeaderRow = monthlyProfitSheet.createRow(0);
            monthlyHeaderRow.createCell(0).setCellValue("Tháng");
            monthlyHeaderRow.createCell(1).setCellValue("Doanh thu");
            monthlyHeaderRow.createCell(2).setCellValue("Chi phí");
            monthlyHeaderRow.createCell(3).setCellValue("Lợi nhuận");

            for (int i = 0; i < 4; i++) {
                monthlyHeaderRow.getCell(i).setCellStyle(headerStyle);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> monthlyData = (List<Map<String, Object>>) monthlyProfitData.get("data");

            int monthlyRowNum = 1;
            for (Map<String, Object> month : monthlyData) {
                Row row = monthlyProfitSheet.createRow(monthlyRowNum++);
                row.createCell(0).setCellValue((String) month.get("period"));

                Cell revenueCell = row.createCell(1);
                revenueCell.setCellValue(((Number) month.get("revenue")).doubleValue());
                revenueCell.setCellStyle(currencyStyle);

                Cell costCell = row.createCell(2);
                costCell.setCellValue(((Number) month.get("cost")).doubleValue());
                costCell.setCellStyle(currencyStyle);

                Cell monthProfitCell = row.createCell(3);
                monthProfitCell.setCellValue(((Number) month.get("profit")).doubleValue());
                monthProfitCell.setCellStyle(currencyStyle);
            }

            // Xuất file Excel sang mảng byte
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}