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
    brand?: string;
    model?: string;
    variant?: string;
    parts?: Array<Part>;
    initials?: string;
    engraving?: string;
    initialsExtra?: object;
    gender?: string;
    size?: number;
    pending?: boolean;
    notify?: boolean;
    productId?: string;
    currency?: string;
    country?: string;
    meta?: Array<string>;
}

export declare class RipeAPI {
    constructor(options?: any);
    authKeyP(key: string, options?: object): Promise<void>;
    importOrderP(ffOrderId: string, options?: ProductionOrderOptions, callback?: Function): Promise<void>;
    _queryToSpec(query: string): Spec;
}