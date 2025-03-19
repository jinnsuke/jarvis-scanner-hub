
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Pen } from "lucide-react";
import { Document } from "@/types/document";
import { useNavigate } from "react-router-dom";

interface DocumentCardProps {
  document: Document;
  onRename: (id: string, newName: string) => void;
}

const DocumentCard = ({ document, onRename }: DocumentCardProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(document.name);

  const handleRename = () => {
    onRename(document.id, name);
    setIsEditing(false);
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/document/${document.id}`);
    }
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img 
          src={document.imageSrc} 
          alt={document.name}
          className="object-cover w-full h-40 transition-transform group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="absolute p-1 bg-white rounded-full shadow-md opacity-0 top-2 right-2 group-hover:opacity-100 transition-opacity"
        >
          <Pen className="w-4 h-4 text-bsc-blue" />
        </button>
      </div>
      <div className="p-3">
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()} className="flex">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-1 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-bsc-blue"
              autoFocus
            />
            <button
              onClick={handleRename}
              className="px-2 text-white bg-bsc-blue rounded-r hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        ) : (
          <h3 className="text-sm font-medium truncate">{document.name}</h3>
        )}
      </div>
    </Card>
  );
};

export default DocumentCard;
