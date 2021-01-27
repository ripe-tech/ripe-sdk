type Part = {
    name: string;
    material: string;
    color: string;
}

type Spec = {
    brand: string;
    model: string;
    parts: Array<Part>;
    initials: string;
    engraving: string;
    initialsExtra: object;
    variant?: string;
    version?: string;
    description?: string;
};

type ProductionOrderOptions = {
    brand: string;
    model: string;
    variant: string;
    parts: Array<Part>;
    initials: string;
    engraving: string;
    initialsExtra: object;
    gender: string;
    size: string;
    pending: boolean;
    notify: boolean;
    productId: string;
    currency: string;
    country: string;
    meta: Array<string>;
}

export declare class Ripe {
    static id: number;
    static VERSION: number;

    constructor(brand?: string, model?: string, options?: any);
    importOrderP(ffOrderId: string, options?: ProductionOrderOptions, callback?: Function): Promise<void>;
    _queryToSpec(query: string): Spec;
}