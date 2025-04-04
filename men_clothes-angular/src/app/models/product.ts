import { ProductImage } from "./product.image";
export interface Product {
    id: number;
    name: string;
    price: number;
    thumbnail: string;
    description: string;
    category_id: number;
    url: string; 
    product_images: ProductImage[];
  
    createdAt?: any;     // Thời gian tạo
    updatedAt?: any;     // Thời gian cập nhật

     // Thuộc tính UI bổ sung
    discount?: number;           // Phần trăm giảm giá
    originalPrice?: number;      // Giá gốc trước khi giảm
    hasGift?: boolean;           // Có quà tặng kèm theo
    rating?: number;             // Đánh giá sao (1-5)
    ratingCount?: number;        // Số lượng đánh giá
    colors?: string[];           // Các màu sắc có sẵn
    categoryName?: string;       // Tên danh mục


  }

  
  