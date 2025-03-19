
import Navbar from "@/components/Navbar";
import { useDocuments } from "@/context/DocumentContext";
import MonthGroup from "@/components/MonthGroup";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Gallery = () => {
  const { groupedDocuments, renameDocument, searchDocuments } = useDocuments();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to upload page if no documents exist
    if (groupedDocuments.length === 0) {
      navigate("/");
    }
  }, [groupedDocuments, navigate]);

  const handleSearch = (query: string) => {
    searchDocuments(query);
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
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="mb-4 text-xl text-gray-500">No documents found</p>
            <Button 
              onClick={() => navigate("/")}
              className="bg-bsc-blue hover:bg-blue-700"
            >
              Upload Document
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
