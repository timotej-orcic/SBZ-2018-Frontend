export class Product {
    id: number;
    type: string;
    manufactorer: string;
    description: string;
    price: number;
    warrantyInMonths: number;
    lagerQuantity: number;

    constructor(id: number, type: string, manufactorer: string, description: string,
        price: number, warrantyInMonths: number, lagerQuantity: number) {
            this.id = id;
            this.type = type;
            this.manufactorer = manufactorer;
            this.description = description;
            this.price = price;
            this.warrantyInMonths = warrantyInMonths;
            this.lagerQuantity = lagerQuantity;
    }
}
