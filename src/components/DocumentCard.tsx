import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
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
  onDelete?: (id: string) => void;
  onClick?: (name: string) => void;
}

const DocumentCard = ({ document, onDelete, onClick }: DocumentCardProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick(document.image_name);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document.image_name);
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
            src={document.s3_image_url} 
            alt={document.image_name}
            className="object-cover w-full h-40 transition-transform group-hover:scale-105"
          />
          {onDelete && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium truncate">{document.image_name}</h3>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Proceed to delete "{document.image_name}"? This action cannot be undone.
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
