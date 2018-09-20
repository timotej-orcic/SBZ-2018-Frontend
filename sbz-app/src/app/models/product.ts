export class Product {
    id: number;
    type: string;
    manufactorer: string;
    description: string;
    specialLabel: number;
    price: number;
    warrantyInMonths: number;
    lagerQuantity: number;

    constructor(id: number, type: string, manufactorer: string, description: string,
        specialLabel: number, price: number, warrantyInMonths: number, lagerQuantity: number) {
            this.id = id;
            this.type = type;
            this.manufactorer = manufactorer;
            this.description = description;
            this.specialLabel = specialLabel;
            this.price = price;
            this.warrantyInMonths = warrantyInMonths;
            this.lagerQuantity = lagerQuantity;
    }
}
