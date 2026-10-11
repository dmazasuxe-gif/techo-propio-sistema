declare module 'pdf-parse' {
  export interface PDFParseOptions {
    data: Buffer | Uint8Array;
    verbosity?: number;
  }

  export class PDFParse {
    constructor(options: PDFParseOptions);
    load(): Promise<void>;
    getText(): Promise<{
      text: string;
      pages: Array<{ text: string; num: number }>;
    }>;
    getScreenshot(options?: {
      pageNumber?: number;
    }): Promise<{
      pages: Array<{
        data: Uint8Array;
        dataUrl?: string;
        pageNumber: number;
        width: number;
        height: number;
        scale: number;
      }>;
      total: number;
    }>;
    destroy(): Promise<void>;
  }
}
