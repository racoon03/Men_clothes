export interface ImportStockDTO {
  variant_id?: number;
  product_id: number;
  color_id?: number;
  size_id?: number;
  additional_quantity: number;
  import_price: number;
  supplier?: string;
  note?: string;
  import_date?: Date;
}