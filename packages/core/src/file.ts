export class UploadedFile {
  id: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
  createdAt: Date;

  constructor(params: {
    id: string;
    name: string;
    mimeType?: string | null;
    size?: number | null;
    createdAt: Date | string;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.mimeType = params.mimeType;
    this.size = params.size;
    this.createdAt = new Date(params.createdAt);
  }
}
