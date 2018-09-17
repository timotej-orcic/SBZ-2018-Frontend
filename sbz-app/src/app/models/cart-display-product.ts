import { DisplayProduct } from './display-product';

export class CartDisplayProduct {
    displayProduct: DisplayProduct;
    quantity: number;

    constructor (displayProduct: DisplayProduct, quantity: number) {
        this.displayProduct = displayProduct;
        this.quantity = quantity;
    }
}
