
export interface Document {
  id: string;
  name: string;
  uploadDate: Date;
  imageSrc: string;
  extractedText?: string;
}

export interface MonthGroup {
  month: string;
  documents: Document[];
}
