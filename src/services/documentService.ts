
import { Document, MonthGroup } from "@/types/document";
import { v4 as uuidv4 } from "uuid";

// Placeholder data
const placeholderImage = "https://placehold.co/600x400/e6f2ff/0055B8?text=BSC+Document";

// Sample document with date set to January 2025
const sampleDocuments: Document[] = [
  {
    id: uuidv4(),
    name: "1/1/25 KTPH Endo",
    uploadDate: new Date(2025, 0, 15), // January 2025 (month is 0-indexed)
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
  return [...sampleDocuments]; // Return a copy to prevent mutation
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
    uploadDate: new Date(2025, 0, 15), // January 2025
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

// Delete a document
export const deleteDocument = (id: string): Document[] => {
  const index = sampleDocuments.findIndex(doc => doc.id === id);
  
  if (index !== -1) {
    sampleDocuments.splice(index, 1);
  }
  
  return [...sampleDocuments]; // Return a copy to prevent mutation
};

// Search documents by name
export const searchDocuments = (query: string): Document[] => {
  return sampleDocuments.filter(doc => 
    doc.name.toLowerCase().includes(query.toLowerCase())
  );
};
