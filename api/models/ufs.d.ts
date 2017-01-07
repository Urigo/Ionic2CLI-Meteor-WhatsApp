declare module 'api/models/ufs' {
  interface Image {
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

  interface Thumbnail extends Image  {
    originalId?: string;
    originalStore?: string;
    originalUrl?: string;
  }
}