package com.project.shopapp.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data//toString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Coupon extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "discount", length = 50)
    private float discount;

    @Column(name = "content", length = 50)
    private String content;

    @Column(name = "codecp")
    private String codecp;

    @Column(name = "startday")
    private LocalDateTime startday;

    @Column(name = "endday")
    private LocalDateTime endday;
}
