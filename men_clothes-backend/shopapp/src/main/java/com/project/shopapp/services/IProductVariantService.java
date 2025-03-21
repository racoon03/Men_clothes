package com.project.shopapp.services;

import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.models.Color;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductVariant;

import java.util.List;

public interface IProductVariantService {
    ProductVariant createProduct(ProductVariantsDTO productVariantsDTO) throws Exception;
    List<ProductVariant> createProducts(List<ProductVariantsDTO> productVariantsDTOs) throws Exception;

    List<Color> getColorsByProductId(Long productId);

     ProductVariant getoneById(long productId, long colorId, long sizeId) throws Exception;


     List<ProductVariant> getProductVariantById(Long productId);
     ProductVariant updateProductVariant (
             long id,
             ProductVariantsDTO productVariantsDTO
     ) throws Exception;

}
