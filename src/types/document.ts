export interface Document {
  image_name: string;
  brand: string;
  item: string;
  dimensions: string;
  gtin: string;
  ref: string;
  lot: string;
  quantity: string;
  user_id: string;
  procedure_date: string;
  hospital: string;
  doctor: string;
  procedure_name: string;
  billing_no: string;
  s3_image_url: string;
}

export interface MonthGroup {
  month: string;
  documents: Document[];
}
