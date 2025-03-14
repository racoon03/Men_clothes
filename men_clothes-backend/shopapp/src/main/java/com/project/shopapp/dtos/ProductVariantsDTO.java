package com.project.shopapp.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductVariantsDTO {
    @Min(value=1, message = "Product's ID must be > 0")
    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("color_id")
    private Long colorId;

    @JsonProperty("size_id")
    private Long sizeId;

    private Long quantity;
}
