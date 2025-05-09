package com.project.shopapp.services;

import com.project.shopapp.dtos.ImportStockDTO;
import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.models.*;
import com.project.shopapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService implements IProductVariantService {
    private final ColorRepository colorRepository;
    private final SizeRepository sizeRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final StockImportHistoryRepository stockImportHistoryRepository;
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

    @Override
    public List<Color> getColorsByProductId(Long productId) {
        List<Long> colorIds = productVariantRepository.findColorsByProductId(productId);
        return colorRepository.findByIdIn(colorIds);
    }

    @Override
    public List<ProductVariant> getProductVariantById(Long productId) {
        List<ProductVariant> productVariants = productVariantRepository.findProductVariantById(productId);
        return productVariants;
    }

    @Override
    public ProductVariant getoneById(long productId, long colorId, long sizeId) throws Exception {
        return productVariantRepository.findByProductIdAndColorIdAndSizeId(productId, colorId, sizeId).
                orElseThrow(()-> new DataNotFoundException(
                        "Cannot find product variant with productId=" + productId +
                                ", colorId=" + colorId +
                                ", sizeId=" + sizeId));
    }


    @Override
    @Transactional
    public ProductVariant updateProductVariant(
            long id,
            ProductVariantsDTO productVariantsDTO
    )
            throws Exception {
        ProductVariant existingProductVariant = getoneById(id, productVariantsDTO.getColorId(),
                productVariantsDTO.getSizeId());
        Color color = colorRepository
                .findById(productVariantsDTO.getColorId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find category with id: "+productVariantsDTO.getColorId()));

        Size size = sizeRepository
                .findById(productVariantsDTO.getSizeId())
                .orElseThrow(() ->
                        new DataNotFoundException(
                                "Cannot find category with id: "+productVariantsDTO.getSizeId()));

        if(existingProductVariant != null) {

            // Cập nhật các thuộc tính
            existingProductVariant.setColor(color);
            existingProductVariant.setSize(size);
            existingProductVariant.setQuantity(productVariantsDTO.getQuantity());

            return productVariantRepository.save(existingProductVariant);
        }
        return null;

    }

    @Override
    @Transactional
    public ProductVariant importStock(ImportStockDTO importStockDTO) throws DataNotFoundException {
        // Find product variant
        ProductVariant variant;
        if (importStockDTO.getVariantId() != null) {
            // Find by variant ID if provided
            variant = productVariantRepository.findById(importStockDTO.getVariantId())
                    .orElseThrow(() -> new DataNotFoundException("Cannot find variant with id: " + importStockDTO.getVariantId()));
        } else {
            // Find by product ID, color ID, and size ID
            variant = productVariantRepository
                    .findByProductIdAndColorIdAndSizeId(
                            importStockDTO.getProductId(),
                            importStockDTO.getColorId(),
                            importStockDTO.getSizeId())
                    .orElseThrow(() -> new DataNotFoundException("Cannot find matching variant"));
        }

        // Find product and its related entities
        Product product = variant.getProduct();
        Color color = variant.getColor();
        Size size = variant.getSize();

        // Update variant quantity
        Long currentQuantity = variant.getQuantity();
        Long newQuantity = currentQuantity + importStockDTO.getAdditionalQuantity();
        variant.setQuantity(newQuantity);

        // Create import history record
        StockImportHistory importHistory = StockImportHistory.builder()
                .productVariant(variant)
                .product(product)
                .color(color)
                .size(size)
                .quantity(importStockDTO.getAdditionalQuantity())
                .importPrice(importStockDTO.getImportPrice())
                .importDate((importStockDTO.getImportDate() != null ? importStockDTO.getImportDate() : LocalDate.now()).atStartOfDay())
                .supplier(importStockDTO.getSupplier())
                .notes(importStockDTO.getNote())
                .build();

        // Save both records
        stockImportHistoryRepository.save(importHistory);
        return productVariantRepository.save(variant);
    }


    @Override
    @Transactional
    public ProductVariant setQuantityToZero(Long variantId) throws DataNotFoundException {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new DataNotFoundException("Không tìm thấy biến thể với id: " + variantId));

        variant.setQuantity(0L);
        return productVariantRepository.save(variant);
    }

    // Phương thức lưu lịch sử nhập hàng (tùy chọn)
    private void saveImportHistory(ProductVariant variant, ImportStockDTO importStockDTO) {
        // Tạo và lưu lịch sử nhập hàng nếu cần
        // Code xử lý lưu lịch sử
    }




//    @Override
//    public List<StockImportHistory> getImportHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
//        return stockImportHistoryRepository.findByImportDateBetweenOrderByImportDateDesc(startDate, endDate);
//    }



}
