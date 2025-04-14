import Navbar from "@/components/Navbar";
import { useDocuments } from "@/context/DocumentContext";
import MonthGroup from "@/components/MonthGroup";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";

const Gallery = () => {
  const { groupedDocuments, deleteDocument, searchDocuments } = useDocuments();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

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
        {groupedDocuments.length > 0 ? (
          groupedDocuments.map((group) => (
            <MonthGroup 
              key={group.month} 
              group={group} 
              onDelete={handleDelete}
              onClick={handleClick} // Add onClick handler here
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
            <p className="text-xl text-gray-500 text-center px-4">
              {searchTerm ? `No documents found matching "${searchTerm}"` : "No documents uploaded yet"}
            </p>
            <Button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-bsc-blue hover:bg-blue-700"
            >
              Upload
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
