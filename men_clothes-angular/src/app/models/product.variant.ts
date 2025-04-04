// product.variant.ts
import { Product } from './product';
import { Color } from './color';
import { Size } from './size';

export interface ProductVariant {
    id: number;
    product: Product;
    color: Color;
    size: Size;
    quantity: number;
}