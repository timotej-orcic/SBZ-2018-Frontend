export class Discount {
    id: number;
    typeId: number;
    beginDate: Date;
    endDate: Date;
    discObjId: number;
    value: number;

    constructor(id: number, typeId: number, beginDate: Date, endDate: Date,
        discObjId: number, value: number) {
        this.id = id;
        this.typeId = typeId;
        this.beginDate = beginDate;
        this.endDate = endDate;
        this.discObjId = discObjId;
        this.value = value;
    }
}
