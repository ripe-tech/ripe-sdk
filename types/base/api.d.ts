type Part = {
    name: string;
    material: string;
    color: string;
}

type Spec = {
    brand: string;
    model: string;
    parts: Part[];
    initials: string;
    engraving: string;
    initialsExtra: InitialsExtra;
    variant?: string;
    version?: string;
    description?: string;
};

type ImportOrderOptions = {
    brand?: string;
    model?: string;
    variant?: string;
    parts?: Part[];
    initials?: string;
    engraving?: string;
    initialsExtra?: InitialsExtra;
    gender?: string;
    size?: number;
    pending?: boolean;
    notify?: boolean;
    productId?: number;
    currency?: string;
    country?: string;
    meta?: string[];
}

type InitialsExtra = Record<string, {
    initials: string;
    engraving?: string;
}>

type RequestOptions = {
    url?: string;
    method?: string;
    params?: Record<string, unknown>,
    headers?: Record<string, unknown>,
    auth?: boolean
}

export declare class RipeAPI {
    constructor(options?: any);
    authKeyP(key: string, options?: RequestOptions): Promise<void>;
    importOrderP(ffOrderId: string, options?: ImportOrderOptions): Promise<void>;
    _queryToSpec(query: string): Spec;
}
