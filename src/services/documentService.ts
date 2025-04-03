
import { Document, MonthGroup } from "@/types/document";
import { v4 as uuidv4 } from "uuid";

// Placeholder image
const placeholderImage = "https://placehold.co/600x400/e6f2ff/0055B8?text=BSC+Document";

// Empty array instead of sample documents
const sampleDocuments: Document[] = [];

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
    uploadDate: new Date(), // Use current date instead of hardcoded date
    imageSrc,
    extractedText: "Sample extracted text from the document. This would contain the actual text extracted from the uploaded image using OCR technology."
  };
  
  sampleDocuments.push(newDocument);
  return newDocument;
};

// Delete a document
export const deleteDocument = (id: string): Document[] => {
  const index = sampleDocuments.findIndex(doc => doc.id === id);
  
  if (index !== -1) {
    sampleDocuments.splice(index, 1);
  }
  
  return [...sampleDocuments]; // Return a copy to prevent mutation
};

// Search documents by name - fixed to be properly case-insensitive and match exact substrings
export const searchDocuments = (query: string): Document[] => {
  if (!query.trim()) {
    return [...sampleDocuments];
  }
  
  const lowercaseQuery = query.toLowerCase().trim();
  return sampleDocuments.filter(doc => 
    doc.name.toLowerCase().includes(lowercaseQuery)
  );
};
