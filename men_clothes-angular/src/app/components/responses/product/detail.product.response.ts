export interface Category {
  id: number;
  name: string;
}

export interface Color {
  id: number;
  name: string;
}

export interface Size {
  id: number;
  name: string;
}

export interface DetailProductResponse {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  description?: string | null; // Giá trị có thể là null
  category: Category;
  color: Color;
  size: Size;
}
