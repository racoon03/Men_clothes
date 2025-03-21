package com.project.shopapp.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class CartItemDTO {
    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("color_id")
    private Long colorId;

    @JsonProperty("size_id")
    private Long sizeId;

    @JsonProperty("quantity")
    private Integer quantity;
}
