
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getDocumentById } from "@/services/documentService";
import { Document } from "@/types/document";

const DocumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<Document | null>(null);
  
  useEffect(() => {
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setDocument(doc);
      } else {
        // Document not found, redirect to gallery
        navigate("/");
      }
    }
  }, [id, navigate]);
  
  if (!document) {
    return <div className="p-4">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container flex items-center h-16 px-4 mx-auto sm:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/")}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center flex-1">
            <h1 className="text-lg font-semibold truncate">{document.name}</h1>
          </div>
        </div>
      </header>
      
      <main className="container p-4 mx-auto">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="mb-4 overflow-hidden rounded-lg">
            <img 
              src={document.imageSrc} 
              alt={document.name}
              className="object-contain w-full max-h-96"
            />
          </div>
          
          <div className="p-4 mt-4 bg-gray-50 rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Extracted Text</h3>
            <p className="text-gray-700">{document.extractedText || "No text extracted from this document."}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
