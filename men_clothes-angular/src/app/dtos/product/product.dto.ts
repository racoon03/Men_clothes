export class ProductDTO {
  name: string;
  price: number;
  thumbnail: string;
  description: string;
  category_id: number;


  constructor(data: any) {
    this.name = data.name || '';
    this.price = data.price || 0;
    this.thumbnail = data.thumbnail || '';
    this.description = data.description || '';
    this.category_id = data.category_id || 0;
  }
}
