package com.project.shopapp.dtos;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;


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

    @JsonProperty("import_price")
    private Float importPrice;

    @JsonProperty("supplier")
    private String supplier;

    private String note;

    @JsonProperty("import_date")
    private LocalDate importDate;
}
