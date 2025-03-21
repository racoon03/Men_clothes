import { IsNumber } from 'class-validator';

export class CartItemDTO {
    @IsNumber()
    product_id: number;

    color_id?: number;

    size_id?: number;

    @IsNumber()
    quantity: number;

    

    constructor(data: any) {
        this.product_id = data.product_id;
        this.color_id = data.color_id;
        this.size_id = data.size_id;
        this.quantity = data.quantity;     
    }
}
