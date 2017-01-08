declare module 'api/models/ufs' {
  interface Picture {
    _id?: string;
    complete?: boolean;
    extension?: string;
    name?: string;
    progress?: number;
    size?: number;
    store?: string;
    token?: string;
    type?: string;
    uploadedAt?: Date;
    uploading?: boolean;
    url?: string;
    userId?: string;
  }
}