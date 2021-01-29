import { Order } from "../api";

export type Part = {
    name: string;
    material: string;
    color: string;
    hidden?: boolean;
    optional?: boolean;
};

export  type InitialsExtra = Record<string, {
    initials: string;
    engraving?: string;
}>;

export type Spec = {
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

export type ImportOrderOptions = {
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
};

export type RequestOptions = {
    url?: string;
    method?: string;
    params?: Record<string, unknown>,
    headers?: Record<string, unknown>,
    auth?: boolean
};

export declare class RipeAPI {
    key?: string;

    constructor(options?: unknown);
    authKeyP(key: string, options?: RequestOptions): Promise<void>;
    importOrderP(ffOrderId: string, options?: ImportOrderOptions): Promise<Order>;
    _queryToSpec(query: string): Spec;
};
