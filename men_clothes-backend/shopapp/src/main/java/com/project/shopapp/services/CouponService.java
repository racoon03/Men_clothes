package com.project.shopapp.services;

import com.project.shopapp.dtos.CouponDTO;
import com.project.shopapp.models.Category;
import com.project.shopapp.models.Coupon;
import com.project.shopapp.repositories.CategoryRepository;
import com.project.shopapp.repositories.CouponRepository;
import com.project.shopapp.responses.CouponResponse;
import jakarta.el.ELException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class CouponService implements ICouponService {
    private final CouponRepository couponRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CouponResponse createCoupon(CouponDTO couponDTO) {
        Category category = categoryRepository.findById(couponDTO.getCategoryId())
                .orElseThrow(() -> new ELException(
                        "Cannot find category with id: " + couponDTO.getCategoryId()));

        // Check that end date is after start date
        if (couponDTO.getEndday().isBefore(couponDTO.getStartday())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Coupon coupon = Coupon.builder()
                .category(category)
                .discount(couponDTO.getDiscount())
                .content(couponDTO.getContent())
                .codecp(couponDTO.getCodecp())
                .startday(couponDTO.getStartday())
                .endday(couponDTO.getEndday())
                .build();

        Coupon savedCoupon = couponRepository.save(coupon);
        return mapCouponToResponse(savedCoupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long couponId) throws Exception {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new Exception(
                        "Cannot find coupon with id: " + couponId));

        couponRepository.delete(coupon);
    }

    @Override
    @Transactional
    public CouponResponse extendCoupon(Long couponId, LocalDateTime newEndDate) throws Exception {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new Exception(
                        "Cannot find coupon with id: " + couponId));

        // Check that new end date is after current end date
        if (newEndDate.isBefore(coupon.getEndday())) {
            throw new IllegalArgumentException("New end date must be after current end date");
        }

        coupon.setEndday(newEndDate);
        Coupon updatedCoupon = couponRepository.save(coupon);

        return mapCouponToResponse(updatedCoupon);
    }

    @Override
    public List<CouponResponse> getAvailableCoupons(LocalDateTime date, Long categoryId) {
        List<Coupon> coupons;

        if (categoryId != null) {
            // Find by both date and category
            coupons = couponRepository.findByStartdayLessThanEqualAndEnddayGreaterThanEqualAndCategoryId(
                    date, date, categoryId);
        }
        else {
            // Find by date only
            coupons = couponRepository.findByStartdayLessThanEqualAndEnddayGreaterThanEqual(
                    date, date);
        }

        return coupons.stream()
                .map(this::mapCouponToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CouponResponse getCouponById(Long couponId) throws Exception {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new Exception(
                        "Cannot find coupon with id: " + couponId));

        return mapCouponToResponse(coupon);
    }

    private CouponResponse mapCouponToResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .categoryId(coupon.getCategory().getId())
                .discount(coupon.getDiscount())
                .codecp(coupon.getCodecp())
                .content(coupon.getContent())
                .startday(coupon.getStartday())
                .endday(coupon.getEndday())
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }

    @Override
    public Page<CouponResponse> getAllCoupons(String keyword, Long categoryId, PageRequest pageRequest) {
        // Sử dụng một phương thức duy nhất để truy vấn
        Page<Coupon> couponsPage = couponRepository.searchCoupons(keyword, categoryId, pageRequest);
        return couponsPage.map(this::mapCouponToResponse);
    }
}
