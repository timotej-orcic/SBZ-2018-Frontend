export class Product {
    id: number;
    name: string;
    manufactorer: string;
    description: string;
    price: number;
    warrantyInMonths: number;

    constructor(id: number, name: string, manufactorer: string, description: string,
        price: number, warrantyInMonths: number) {
            this.id = id;
            this.name = name;
            this.manufactorer = manufactorer;
            this.description = description;
            this.price = price;
            this.warrantyInMonths = warrantyInMonths;
    }
}
