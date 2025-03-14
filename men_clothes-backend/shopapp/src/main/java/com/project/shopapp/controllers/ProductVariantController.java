package com.project.shopapp.controllers;

import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductVariant;
import com.project.shopapp.services.IProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/product-variants")
@RequiredArgsConstructor
public class ProductVariantController {
    private final IProductVariantService productVariantService;
    @PostMapping("")
    public ResponseEntity<?> createProductVariant(
            @Valid @RequestBody ProductVariantsDTO productVariantsDTO,
            BindingResult result
    ) {
        try {
            if(result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            ProductVariant newProduct = productVariantService.createProduct(productVariantsDTO);
            return ResponseEntity.ok(newProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/batch")
    public ResponseEntity<?> createProductVariants(
            @Valid @RequestBody List<ProductVariantsDTO> productVariantsDTOs,
            BindingResult result
    ) {
        try {
            if(result.hasErrors()) {
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                return ResponseEntity.badRequest().body(errorMessages);
            }
            List<ProductVariant> newVariants = productVariantService.createProducts(productVariantsDTOs);
            return ResponseEntity.ok(newVariants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
