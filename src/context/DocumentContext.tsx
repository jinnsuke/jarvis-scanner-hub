
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Document, MonthGroup } from "@/types/document";
import { 
  getAllDocuments, 
  addDocument, 
  searchDocuments as searchDocumentsService,
  groupDocumentsByMonth,
  deleteDocument as deleteDocumentService
} from "@/services/documentService";

interface DocumentContextType {
  documents: Document[];
  groupedDocuments: MonthGroup[];
  filteredDocuments: Document[];
  addNewDocument: (name: string, imageSrc: string) => Document;
  searchDocuments: (query: string) => void;
  deleteDocument: (id: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Document[]>(getAllDocuments());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(documents);
  
  // Update filtered documents whenever search query or documents change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
    } else {
      // Improved search filter to be exact match on substrings
      const results = searchDocumentsService(searchQuery);
      setFilteredDocuments(results);
    }
  }, [searchQuery, documents]);

  const groupedDocuments = groupDocumentsByMonth(filteredDocuments);
  
  const addNewDocument = (name: string, imageSrc: string) => {
    const newDoc = addDocument(name, imageSrc);
    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    return newDoc;
  };
  
  const searchDocuments = (query: string) => {
    setSearchQuery(query);
  };
  
  const deleteDocument = (id: string) => {
    const remainingDocs = deleteDocumentService(id);
    setDocuments(remainingDocs);
  };
  
  return (
    <DocumentContext.Provider
      value={{
        documents,
        groupedDocuments,
        filteredDocuments,
        addNewDocument,
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
