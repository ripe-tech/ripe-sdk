import { Part } from "../base";

export type OrderState = {
    id: number;
    enabled: boolean;
    description?: string;
    created: number;
    modified: number;
    meta: Record<string, unknown>;
    brand_t?: string;
    retailer_t?: string;
    vendor_t?: string;
    name: string;
    justification?: string;
    timestamp: number;
    email: string;
}

export type Attachment = {
    name: string;
    key?: string;
    kind: string;
    content_type?: string;
    url?: string;
}

export type ComponentPrice = {
    rule_id: number;
    rule_count: number;
    price_taxes: number;
    vat: number;
    price: number;
    currency: string;
    hs_code: number;
    notes: string[];
    hs_code_priority: number;
    price_original: number;
    vat_included: boolean;
    ddp_included: boolean;
    fixed_price: boolean;
    round_price: boolean;
    base_country: string;
    base_currency: string;
    exchanged?: boolean;
    cites: boolean;
}

export type TotalPrice = {
    price_final: number;
    price_taxes: number;
    vat: number;
    ddp: number;
    ddp_percent: number;
    vat_rate: number;
    price: number;
    currency: string;
    country: string;
    hs_codes: number[];
    hs_code_priority: number;
    shipping:number;
    notes: string[];
    diag: {
        no_round: {
            price_final: number;
            price_taxes: number;
            price: number;
            vat: number;
            ddp: number;
        };
        patch: boolean;
        round_value: boolean;
        is_vat: boolean;
        is_ddp: boolean;
        is_european: boolean;
        is_rounded: boolean;
        vat_included: boolean;
        ddp_included: boolean;
        fixed_price: boolean;
        round_price: boolean;
        base_country: string;
        base_currency: string;
        exchanged: boolean;
    },
    cites: boolean;
}

export type OrderDetails = {
    brand: string;
    model: string;
    variant?: string;
    parts: Part[];
    parts_m: Record<string, {
        material: string;
        color: string;
    }>;
    gender: string;
    size: number;
    query: string;
    url: string;
    image: string;
    extras: number;
}

export enum OrderStatus {
    pending = "pending",
    created = "created",
    production = "production",
    ready = "ready",
    sent = "sent",
    received = "received",
    returned = "returned",
    canceled = "canceled"
}

export enum OrderProductionStatus {
    unset = "unset",
    waiting = "waiting",
    cutting = "cutting",
    sewing = "sewing",
    assembling = "assembling",
    produced = "produced",
    canceled = "canceled"
}

export enum Gender {
    male = "male",
    female = "female",
    kids = "kids",
    unknown = "unknown"
}

export type Order = {
    id: number;
    number: number;
    brand_t?: string;
    retailer_t?: string;
    vendor_t?: string;
    key?: number;
    status: OrderStatus;
    status_index: OrderProductionStatus;
    production_status?: OrderProductionStatus;
    production?: string;
    gender: Gender;
    currency?: string;
    country?: string;
    price?: number;
    brand: string;
    shoe: string;
    variant?: string;
    shoe_query?: string;
    shoe_url: string;
    image_url?: string;
    minify_hash?: string;
    image_hash?: string;
    image_o_hash?: string;
    top_hash?: string;
    top_o_hash?: string;
    bottom_hash?: string;
    bottom_o_hash?: string;
    back_hash?: string;
    side_hash?: string;
    structure: string;
    ff_id?: number;
    ff_shoe_id?: number;
    ff_order_id?: string;
    delivery_time?: number;
    tracking_number?: string;
    tracking_url?: string;
    report_url_e?: string;
    notes?: string[];
    prices?: {
        components: Record<string, ComponentPrice>;
        total: TotalPrice
    };
    states?: OrderState[];
    attachments?: Attachment[];
    account?: string;
    customer?: string;
    ambassador?: string;
    store?: string;
    number_s?: string;
    channel?: string;
    delivery_d?: number;
    scale?: string;
    size_scaled?: number;
    details?: OrderDetails;
}
