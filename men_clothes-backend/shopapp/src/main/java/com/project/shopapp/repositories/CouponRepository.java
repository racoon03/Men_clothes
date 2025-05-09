package com.project.shopapp.repositories;

import com.project.shopapp.models.Color;
import com.project.shopapp.models.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    // Find coupons valid for a specific date
    List<Coupon> findByStartdayLessThanEqualAndEnddayGreaterThanEqual(
            LocalDateTime date, LocalDateTime sameDate);
    // Find coupons valid for a specific date and category
    List<Coupon> findByStartdayLessThanEqualAndEnddayGreaterThanEqualAndCategoryId(
            LocalDateTime date, LocalDateTime sameDate, Long categoryId);

    Page<Coupon> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Coupon> findByCodecpContainingIgnoreCase(String keyword, Pageable pageable);
    Page<Coupon> findByCategoryIdAndCodecpContainingIgnoreCase(Long categoryId, String keyword, Pageable pageable);

    @Query("SELECT c FROM Coupon c WHERE " +
            "(:category IS NULL OR :category = 0 OR c.category = :category) " +
            "AND (:keyword IS NULL OR :keyword = '' OR c.content LIKE %:keyword% OR c.codecp LIKE %:keyword%)")
    Page<Coupon> searchCoupons(
            @Param("keyword") String keyword,
            @Param("category") Long category,
            Pageable pageable);
}
