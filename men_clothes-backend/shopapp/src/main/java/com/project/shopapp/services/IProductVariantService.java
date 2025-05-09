package com.project.shopapp.services;

import com.project.shopapp.dtos.ImportStockDTO;
import com.project.shopapp.dtos.ProductDTO;
import com.project.shopapp.dtos.ProductVariantsDTO;
import com.project.shopapp.exceptions.DataNotFoundException;
import com.project.shopapp.models.Color;
import com.project.shopapp.models.Product;
import com.project.shopapp.models.ProductVariant;
import com.project.shopapp.models.StockImportHistory;

import java.time.LocalDateTime;
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

    ProductVariant importStock(ImportStockDTO importStockDTO) throws DataNotFoundException;
    ProductVariant setQuantityToZero(Long variantId) throws DataNotFoundException;

    /**
     * Lấy lịch sử nhập hàng theo sản phẩm
     */
    //List<StockImportHistory> getImportHistory(Long productId);

    /**
     * Lấy lịch sử nhập hàng theo biến thể sản phẩm
     */
    //List<StockImportHistory> getImportHistoryByVariant(Long variantId);

    /**
     * Lấy lịch sử nhập hàng theo khoảng thời gian
     */
    //List<StockImportHistory> getImportHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Tính tổng chi phí nhập hàng theo sản phẩm trong khoảng thời gian
     */
    //Float calculateImportCost(Long productId, LocalDateTime startDate, LocalDateTime endDate);

}
