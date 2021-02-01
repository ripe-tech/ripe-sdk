export type Attachment = {
    name: string;
    key?: string;
    kind: string;
    content_type?: string;
    url?: string;
    [x: string]: any;
};
