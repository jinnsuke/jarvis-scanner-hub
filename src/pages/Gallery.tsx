
import Navbar from "@/components/Navbar";
import { useDocuments } from "@/context/DocumentContext";
import MonthGroup from "@/components/MonthGroup";
import { useEffect } from "react";

const Gallery = () => {
  const { groupedDocuments, renameDocument, searchDocuments } = useDocuments();

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
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;
