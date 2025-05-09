package com.project.shopapp.repositories;

import com.project.shopapp.models.StockImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface StockImportHistoryRepository extends JpaRepository<StockImportHistory, Long> {
    /**
     * Tìm lịch sử nhập hàng trong khoảng thời gian và sắp xếp theo ngày nhập giảm dần
     */
    List<StockImportHistory> findByImportDateBetweenOrderByImportDateDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Tìm lịch sử nhập hàng theo sản phẩm và khoảng thời gian
     */
    List<StockImportHistory> findByProductIdAndImportDateBetweenOrderByImportDateDesc(
            Long productId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Tính tổng chi phí nhập hàng trong khoảng thời gian
     */
    @Query("SELECT SUM(s.importPrice * s.quantity) FROM StockImportHistory s WHERE s.importDate BETWEEN :startDate AND :endDate")
    Float calculateTotalImportCost(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Tìm các sản phẩm có số lượng tồn kho dưới ngưỡng
     */
    @Query("SELECT s FROM StockImportHistory s WHERE s.quantity < :threshold")
    List<StockImportHistory> findByQuantityLessThan(@Param("threshold") Long threshold);
}
