package com.project.shopapp.services;

import com.project.shopapp.dtos.CouponDTO;
import com.project.shopapp.responses.CouponResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ICouponService {
    CouponResponse createCoupon(CouponDTO couponDTO);

    void deleteCoupon(Long couponId) throws Exception;

    CouponResponse extendCoupon(Long couponId, LocalDateTime newEndDate) throws Exception;

    List<CouponResponse> getAvailableCoupons(LocalDateTime date, Long categoryId);

    CouponResponse getCouponById(Long couponId) throws Exception;

    Page<CouponResponse> getAllCoupons(String keyword, Long categoryId, PageRequest pageRequest);
}
