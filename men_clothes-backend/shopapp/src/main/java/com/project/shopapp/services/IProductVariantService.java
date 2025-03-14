package com.project.shopapp.services;

import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductVariant;

import java.util.List;

public interface IProductVariantService {
    ProductVariant createProduct(ProductVariantsDTO productVariantsDTO) throws Exception;
    List<ProductVariant> createProducts(List<ProductVariantsDTO> productVariantsDTOs) throws Exception;

}
