import React from 'react';
import { useDocuments } from '@/context/DocumentContext';
import MonthGroup from '@/components/MonthGroup';
import { Loader2 as Spinner } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { groupDocumentsByMonth } from '@/services/documentService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const Gallery = () => {
  const { documents, loading, error, searchQuery, setSearchQuery } = useDocuments();
  const groupedDocuments = groupDocumentsByMonth(documents);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDelete = (id: string) => {
    // Implement delete logic here
    toast({
      title: "Document deleted",
      description: "The document has been successfully deleted.",
    });
  };

  const handleClick = (name: string) => {
    // Encode the document name to make it URL-safe
    const encodedName = encodeURIComponent(name);
    navigate(`/document/${encodedName}`);  // Navigate using the document name
  };

  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <Navbar onSearch={handleSearch} showSearch={true}>
        <Button
          onClick={() => navigate("/export")}
          variant="outline"
          className="flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </Navbar>
      
      <main className="container p-4 mx-auto">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && groupedDocuments.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No documents found
          </div>
        )}

        {!loading && !error && groupedDocuments.map((group) => (
          <MonthGroup
            key={group.month}
            group={group}
            onDelete={handleDelete}
            onClick={handleClick}
          />
        ))}
      </main>
    </div>
  );
};

export default Gallery;
