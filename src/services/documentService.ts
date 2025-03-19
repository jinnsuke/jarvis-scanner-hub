
import { Document, MonthGroup } from "@/types/document";
import { v4 as uuidv4 } from "uuid";

// Placeholder data
const placeholderImage = "https://placehold.co/600x400/e6f2ff/0055B8?text=BSC+Document";

// Only one document as requested
const sampleDocuments: Document[] = [
  {
    id: uuidv4(),
    name: "Boston Scientific MUSTANG 7.0mm x 60mm 75cm",
    uploadDate: new Date(2023, 7, 15),
    imageSrc: placeholderImage,
    extractedText: "Boston Scientific MUSTANG 7.0mm x 60mm 75cm GTIN 12345 REF H12345 LOT 12345"
  }
];

// Function to group documents by month
export const groupDocumentsByMonth = (documents: Document[]): MonthGroup[] => {
  const groupedDocs: { [key: string]: Document[] } = {};
  
  documents.forEach(doc => {
    const date = new Date(doc.uploadDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groupedDocs[monthYear]) {
      groupedDocs[monthYear] = [];
    }
    
    groupedDocs[monthYear].push(doc);
  });
  
  return Object.keys(groupedDocs).map(monthYear => ({
    month: monthYear,
    documents: groupedDocs[monthYear]
  }));
};

// Get all documents
export const getAllDocuments = (): Document[] => {
  return sampleDocuments;
};

// Get document by ID
export const getDocumentById = (id: string): Document | undefined => {
  return sampleDocuments.find(doc => doc.id === id);
};

// Add a new document
export const addDocument = (name: string, imageSrc: string): Document => {
  const newDocument: Document = {
    id: uuidv4(),
    name,
    uploadDate: new Date(),
    imageSrc,
    extractedText: "Sample extracted text from the document. This would contain the actual text extracted from the uploaded image using OCR technology."
  };
  
  sampleDocuments.push(newDocument);
  return newDocument;
};

// Rename a document
export const renameDocument = (id: string, newName: string): Document | undefined => {
  const document = sampleDocuments.find(doc => doc.id === id);
  
  if (document) {
    document.name = newName;
  }
  
  return document;
};

// Search documents by name
export const searchDocuments = (query: string): Document[] => {
  return sampleDocuments.filter(doc => 
    doc.name.toLowerCase().includes(query.toLowerCase())
  );
};
