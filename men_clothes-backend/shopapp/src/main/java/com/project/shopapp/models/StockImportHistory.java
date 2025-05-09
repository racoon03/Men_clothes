package com.project.shopapp.models;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_import_history")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StockImportHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "color_id")
    private Color color;

    @ManyToOne
    @JoinColumn(name = "size_id")
    private Size size;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "import_price", nullable = false)
    private Float importPrice;

    @Column(name = "import_date", nullable = false)
    private LocalDateTime importDate;

    @Column(name = "supplier")
    private String supplier;

    @Column(name = "notes")
    private String notes;
}
