export class DisplayFile {
    id: number;
    name: string;
    type: string;
    base64: string;
    src: string;

    constructor(id: number, name: string, type: string, base64: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.base64 = base64;
        this.src = this.computeSrc(type, base64);
    }

    computeSrc(type: string, base64: string) {
        return 'data:' + type + ';base64,' + base64;
    }
}
