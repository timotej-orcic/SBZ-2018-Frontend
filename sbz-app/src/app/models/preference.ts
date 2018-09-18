export class Preference {
    id: number;
    userId: number;
    productType: string;
    preferenceType: string;
    value: string;
    productsCount: number;
    percentage: number;

    constructor(id: number, userId: number, productType: string, preferenceType: string,
        value: string, productsCount: number, percentage: number) {
            this.id = id;
            this.userId = userId;
            this.productType = productType;
            this.preferenceType = preferenceType;
            this.value = value;
            this.productsCount = productsCount;
            this.percentage = percentage;
    }
}
