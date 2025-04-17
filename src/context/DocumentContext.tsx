import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Document } from '@/types/document';
import { fetchDocuments, searchDocuments, deleteDocument } from '@/services/documentService';
import { useAuth } from './AuthContext';

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  deleteDocument: (documentName: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  const refreshDocuments = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const docs = await fetchDocuments(token);
      setDocuments(docs);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDocuments();
  }, [token]);

  useEffect(() => {
    const searchDocs = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        const results = await searchDocuments(searchQuery, token);
        setDocuments(results);
      } catch (err) {
        setError('Failed to search documents');
        console.error('Error searching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) {
      searchDocs();
    } else {
      refreshDocuments();
    }
  }, [searchQuery, token]);

  const handleDeleteDocument = async (documentName: string) => {
    if (!token) return;
    
    try {
      await deleteDocument(documentName, token);
      await refreshDocuments();
    } catch (err) {
      setError('Failed to delete document');
      console.error('Error deleting document:', err);
    }
  };

  const value = {
    documents,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDocument: handleDeleteDocument,
    refreshDocuments
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
