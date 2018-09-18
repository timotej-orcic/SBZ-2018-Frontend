import { Product } from './product';
import { DisplayFile } from './display-file';
import { Preference } from './preference';

export class DisplayProduct {
    product: Product;
    image: DisplayFile;
    preferences: Preference[];

    constructor(product: Product, image: DisplayFile, preferences: Preference[]) {
        this.product = product;
        this.image = image;
        this.preferences = preferences;
    }
}
