package com.project.shopapp.services;

import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.models.Color;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductVariant;
import com.project.shopapp.models.Size;
import com.project.shopapp.repositories.ColorRepository;
import com.project.shopapp.repositories.ProductRepository;
import com.project.shopapp.repositories.ProductVariantRepository;
import com.project.shopapp.repositories.SizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService implements IProductVariantService {
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    @Override
    public ProductVariant createProduct(ProductVariantsDTO productVariantsDTO) throws Exception {
        Color existingColor = colorRepository
                .findById(productVariantsDTO.getColorId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find category with id: "+productVariantsDTO.getColorId()));
        Size existingSize = sizeRepository
                .findById(productVariantsDTO.getSizeId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find category with id: "+productVariantsDTO.getSizeId()));
        Product existingProduct = productRepository.findById(productVariantsDTO.getProductId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find product with id: "+productVariantsDTO.getProductId()));
        ProductVariant newProduct = ProductVariant.builder()
                .product(existingProduct)
                .color(existingColor)
                .size(existingSize)
                .quantity(productVariantsDTO.getQuantity())
                .build();
        return productVariantRepository.save(newProduct);
    }

    @Override
    @Transactional
    public List<ProductVariant> createProducts(List<ProductVariantsDTO> productVariantsDTOs) throws Exception {
        if (productVariantsDTOs.isEmpty()) {
            throw new IllegalArgumentException("Product variants list cannot be empty");
        }

        List<ProductVariant> savedVariants = new ArrayList<>();

        for (ProductVariantsDTO dto : productVariantsDTOs) {
            // Kiểm tra xem biến thể đã tồn tại chưa
            boolean exists = productVariantRepository.existsByProductIdAndColorIdAndSizeId(
                    dto.getProductId(),
                    dto.getColorId(),
                    dto.getSizeId());

            if (exists) {
                throw new IllegalArgumentException(
                        "Variant with product ID" + dto.getColorId() +
                                "color ID " + dto.getColorId() +
                                ", and size ID " + dto.getSizeId() +
                                " already exists");
            }

            // Tạo biến thể mới
            ProductVariant newVariant = createProduct(dto);
            savedVariants.add(newVariant);
        }

        return savedVariants;
    }

}
