export class CreateProductVariantDTO {
  product_id: number;
  color_id: number;
  size_id: number;
  quantity: number;

  

  constructor(data: any) {
    this.product_id = data.product_id || 0;
    this.color_id = data.color_id || 0;
    this.size_id = data.size_id || 0;
    this.quantity = data.quantity || 0;
  }
}