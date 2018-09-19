import { Product } from './product';
import { DisplayFile } from './display-file';

export class DisplayProduct {
    product: Product;
    image: DisplayFile;

    constructor(product: Product, image: DisplayFile) {
        this.product = product;
        this.image = image;
    }
}
