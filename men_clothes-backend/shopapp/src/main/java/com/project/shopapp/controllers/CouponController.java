package com.project.shopapp.controllers;

import com.project.shopapp.components.LocalizationUtils;
import com.project.shopapp.dtos.CouponDTO;
import com.project.shopapp.models.Coupon;
import com.project.shopapp.responses.CouponListResponse;
import com.project.shopapp.responses.CouponResponse;
import com.project.shopapp.responses.ResponseObject;
import com.project.shopapp.services.ICouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.FieldError;


import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("${api.prefix}/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final ICouponService couponService;
    private final LocalizationUtils localizationUtils;

    // tao moi coupon
    @PostMapping("")
    public ResponseEntity<?> createCoupon(
            @Valid @RequestBody CouponDTO couponDTO,
            BindingResult result
    ) {
        try {
            if(result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            CouponResponse couponResponse = couponService.createCoupon(couponDTO);
            return ResponseEntity.ok(couponResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // xoa coupon
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCoupon(@Valid @PathVariable Long id) {
        try {
            couponService.deleteCoupon(id);
            return ResponseEntity.ok(String.format("Coupon with id = %d deleted successfully", id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // coupon kha dụng
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableCoupons(
            @RequestParam(required = true) Long categoryId,
            @RequestParam(required = false) String dateStr
    ) {
        try {
            LocalDateTime date = LocalDateTime.parse(dateStr);
            List<CouponResponse> couponResponses = couponService.getAvailableCoupons(date, categoryId);
            return ResponseEntity.ok(couponResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObject(e.getMessage(), HttpStatus.BAD_REQUEST, null));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<CouponListResponse> getCoupons(
            @RequestParam(defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0", name = "category_id") Long categoryId,
            @RequestParam("page") int page,
            @RequestParam("limit") int limit
    ) {
        // Tạo Pageable từ thông tin trang và giới hạn, sắp xếp theo createdAt giảm dần (mới nhất trước)
        PageRequest pageRequest = PageRequest.of(
                page-1 , limit,
                Sort.by("createdAt").descending());

        Page<CouponResponse> couponPage = couponService.getAllCoupons(keyword, categoryId, pageRequest);

        // Lấy tổng số trang
        int totalPages = couponPage.getTotalPages();
        List<CouponResponse> coupons = couponPage.getContent();

        return ResponseEntity.ok(CouponListResponse
                .builder()
                .coupons(coupons)
                .totalPages(totalPages)
                .build());
    }

    // Endpoint để mở rộng ngày áp dụng coupon
    @PutMapping("/extend/{id}")
    public ResponseEntity<?> extendCoupon(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newEndDate
    ) {
        try {
            CouponResponse couponResponse = couponService.extendCoupon(id, newEndDate);
            return ResponseEntity.ok(couponResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ResponseObject(e.getMessage(), HttpStatus.BAD_REQUEST, null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseObject(e.getMessage(), HttpStatus.BAD_REQUEST, null));
        }
    }

}
