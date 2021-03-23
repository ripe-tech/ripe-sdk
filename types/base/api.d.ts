import { Build, Order, Prices } from "../api";

export type Part = {
    name: string;
    material: string;
    color: string;
    hidden?: boolean;
    optional?: boolean;
};

export type InitialsExtra = Record<
    string,
    {
        initials: string;
        engraving?: string;
    }
>;

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

export type PriceOptions = {
    brand?: string;
    model?: string;
    variant?: string;
    version?: string;
    frame?: string;
    parts?: Part[];
    engraving?: string;
    initials?: string;
    initialsExtra?: InitialsExtra;
    country?: string;
    currency?: string;
    flag?: boolean;
    full?: boolean;
};

export type RequestOptions = {
    url?: string;
    method?: string;
    params?: Record<string, unknown>;
    headers?: Record<string, unknown>;
    auth?: boolean;
};

export type GetRequestOptions = RequestOptions & {
    params?: {
        filters?: string[];
        sort?: string[];
        skip?: number;
        limit?: number;
    };
};

export declare class RipeAPI {
    key?: string;

    constructor(options?: unknown);
    authKeyP(key: string, options?: RequestOptions): Promise<void>;
    importOrderP(ffOrderId: string, options?: ImportOrderOptions): Promise<Order>;
    getOrdersP(options?: GetRequestOptions): Promise<Order[]>;
    deleteOrderP(number: number, options?: RequestOptions): Promise<void>;
    getPriceP(options?: PriceOptions): Promise<Prices>;
    nativeToSizeP(
        scale: string,
        value: number,
        gender: string,
        options?: RequestOptions
    ): Promise<{ value: number }>;
    getBuildP(name: string, options?: GetRequestOptions): Promise<Build>;
    getBuildsP(options?: GetRequestOptions): Promise<Build[]>;
    _queryToSpec(query: string): Spec;
}
