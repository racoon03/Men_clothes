export class Coupon {
  category_id: number;
  discount: number;
  content: string;
  codeCp: string;
  startday: string;
  endday: string;

  constructor(
    category_id: number = 0,
    discount: number = 0,
    content: string = '',
    codeCp: string = '',
    startday: string = '',
    endday: string = ''
  ) {
    this.category_id = category_id;
    this.discount = discount;
    this.content = content;
    this.codeCp = codeCp;
    this.startday = startday;
    this.endday = endday;
  }
}