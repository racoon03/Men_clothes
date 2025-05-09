package com.project.shopapp.responses;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CouponListResponse {
    @JsonProperty("coupons")
    private List<CouponResponse> coupons;

    @JsonProperty("total_pages")
    private int totalPages;
}
