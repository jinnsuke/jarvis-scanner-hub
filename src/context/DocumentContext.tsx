
import { createContext, useState, useContext, ReactNode } from "react";
import { Document, MonthGroup } from "@/types/document";
import { 
  getAllDocuments, 
  addDocument, 
  renameDocument as renameDocumentService,
  searchDocuments as searchDocumentsService,
  groupDocumentsByMonth,
  deleteDocument as deleteDocumentService
} from "@/services/documentService";

interface DocumentContextType {
  documents: Document[];
  groupedDocuments: MonthGroup[];
  filteredDocuments: Document[];
  addNewDocument: (name: string, imageSrc: string) => Document;
  renameDocument: (id: string, newName: string) => void;
  searchDocuments: (query: string) => void;
  deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>(getAllDocuments());
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);
  
  const groupedDocuments = groupDocumentsByMonth(filteredDocuments);
  
  const addNewDocument = (name: string, imageSrc: string) => {
    const newDoc = addDocument(name, imageSrc);
    setDocuments([...documents, newDoc]);
    setFilteredDocuments([...documents, newDoc]);
    return newDoc;
  };
  
  const renameDocument = (id: string, newName: string) => {
    const updatedDoc = renameDocumentService(id, newName);
    if (updatedDoc) {
      setDocuments(documents.map(doc => doc.id === id ? { ...doc, name: newName } : doc));
      setFilteredDocuments(filteredDocuments.map(doc => doc.id === id ? { ...doc, name: newName } : doc));
    }
  };
  
  const searchDocuments = (query: string) => {
    if (!query.trim()) {
      setFilteredDocuments(documents);
    } else {
      const results = searchDocumentsService(query);
      setFilteredDocuments(results);
    }
  };
  
  const deleteDocument = (id: string) => {
    const remainingDocs = deleteDocumentService(id);
    setDocuments(remainingDocs);
    setFilteredDocuments(remainingDocs);
  };
  
  return (
    <DocumentContext.Provider
      value={{
        documents,
        groupedDocuments,
        filteredDocuments,
        addNewDocument,
        renameDocument,
        searchDocuments,
        deleteDocument
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
