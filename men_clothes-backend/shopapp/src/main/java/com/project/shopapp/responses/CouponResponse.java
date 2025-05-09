package com.project.shopapp.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CouponResponse {

    private Long id;

    @JsonProperty("category_id")
    private Long categoryId;

    @JsonProperty("content")
    private String content;

    @JsonProperty("codecp")
    private String codecp;

    @JsonProperty("discount")
    private Float discount;

    @JsonProperty("startday")
    private LocalDateTime startday;

    @JsonProperty("endday")
    private LocalDateTime endday;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
