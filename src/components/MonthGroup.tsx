import { useState } from "react";
import { MonthGroup as MonthGroupType } from "@/types/document";
import DocumentCard from "./DocumentCard";
import { useNavigate } from "react-router-dom";  // Import useNavigate

interface MonthGroupProps {
  group: MonthGroupType;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onClick: (name: string) => void;  // Ensure onClick is passed down
}

const MonthGroup = ({ group, onRename, onDelete, onClick }: MonthGroupProps) => {
  const navigate = useNavigate();  // Initialize navigate hook

  const handleDocumentClick = (name: string) => {
    const encodedName = encodeURIComponent(name);  // Encode the document name
    navigate(`/document/${encodedName}`);  // Navigate to the document detail page
  };

  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="mb-3 text-base font-semibold text-bsc-darktext sm:mb-4 sm:text-lg">{group.month}</h2>
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
        {group.documents.map((document) => (
          <DocumentCard 
            key={document.id} 
            document={document} 
            onRename={onRename} 
            onDelete={onDelete}
            onClick={(name) => handleDocumentClick(name)}  // Pass handleDocumentClick to onClick
          />
        ))}
      </div>
    </div>
  );
};

export default MonthGroup;
