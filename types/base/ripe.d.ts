type Part = {
    name: string;
    material: string;
    color: string;
}

type Spec = {
    brand: string;
    model: string;
    parts: Array<Part>,
    initials: string;
    engraving: string,
    initials_extra: object
    variant?: string;
    version?: string;
    description?: string;
};

export declare class Ripe {
    static id: number;
    static VERSION: number;

    constructor(brand?: string, model?: string, options?: any);
    importOrderP(ffOrderId: string, options?: object, callback?: Function): Promise<void>;
    _queryToSpec(query: string): Spec;
}