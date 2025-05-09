package com.project.shopapp.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CouponDTO {
    @JsonProperty("category_id")
    private Long categoryId;

    @JsonProperty("discount")
    private float discount;

    @JsonProperty("content")
    private String content;

    @JsonProperty("codeCp")
    private String codecp;

    @JsonProperty("startday")
    private LocalDateTime startday;

    @JsonProperty("endday")
    private LocalDateTime endday;
}
