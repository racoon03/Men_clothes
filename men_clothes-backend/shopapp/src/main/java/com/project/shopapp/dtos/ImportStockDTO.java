package com.project.shopapp.dtos;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ImportStockDTO {
    @JsonProperty("variant_id")
    private Long variantId;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("color_id")
    private Long colorId;

    @JsonProperty("size_id")
    private Long sizeId;

    @JsonProperty("additional_quantity")
    private Long additionalQuantity;

    private String note;
}
