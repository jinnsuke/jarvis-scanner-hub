
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Pen, Trash2 } from "lucide-react";
import { Document } from "@/types/document";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DocumentCardProps {
  document: Document;
  onRename: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
}

const DocumentCard = ({ document, onRename, onDelete }: DocumentCardProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(document.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleRename = () => {
    onRename(document.id, name);
    setIsEditing(false);
  };

  const handleCardClick = () => {
    if (!isEditing) {
      navigate(`/document/${document.id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
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
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 bg-white rounded-full shadow-md"
              title="Rename"
            >
              <Pen className="w-4 h-4 text-bsc-blue" />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="p-1 bg-white rounded-full shadow-md"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Proceed to delete "{document.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 text-white hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentCard;
