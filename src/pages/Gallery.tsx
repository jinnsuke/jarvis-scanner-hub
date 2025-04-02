import Navbar from "@/components/Navbar";
import { useDocuments } from "@/context/DocumentContext";
import MonthGroup from "@/components/MonthGroup";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Gallery = () => {
  const { groupedDocuments, renameDocument, deleteDocument, searchDocuments } = useDocuments();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect to upload page if no documents exist
    if (groupedDocuments.length === 0 && !searchTerm) {
      navigate("/");
    }
  }, [groupedDocuments, navigate, searchTerm]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    searchDocuments(query);
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
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
      <Navbar onSearch={handleSearch} showSearch={true} />
      
      <main className="container p-4 mx-auto">
        {groupedDocuments.length > 0 ? (
          groupedDocuments.map((group) => (
            <MonthGroup 
              key={group.month} 
              group={group} 
              onRename={renameDocument}
              onDelete={handleDelete}
              onClick={handleClick} // Add onClick handler here
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
            <p className="text-xl text-gray-500 text-center px-4">
              {searchTerm ? `No documents found matching "${searchTerm}"` : "No documents found"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
