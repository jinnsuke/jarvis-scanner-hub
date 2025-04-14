import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useDocuments } from "@/context/DocumentContext";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentData {
  gtin: string;
  brand: string;
  item: string;
  dimensions: string;
  lot: string;
  ref: string;
  quantity: string;
  file_key?: string;
}

interface EditingState {
  isEditing: boolean;
  gtin: string | null;
  value: string;
}

const DocumentDetail = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const { documents } = useDocuments();

  const [document, setDocument] = useState<DocumentData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({
    isEditing: false,
    gtin: null,
    value: ""
  });

  useEffect(() => {
    let isMounted = true;

      const fetchDocument = async () => {
      if (!name) return;

      try {
        setLoading(true);
        setError(null);

        // Find the document in the context first
        const decodedName = decodeURIComponent(name);
        const existingDoc = documents.find(doc => doc.name === decodedName);
        if (existingDoc?.imageSrc) {
          setImageUrl(existingDoc.imageSrc);
        }

        const response = await fetch(`http://localhost:3000/api/document/${name}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!isMounted) return;

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setDocument(data);
            // If we have a file_key from S3, construct the S3 URL
            if (data[0].file_key && !imageUrl) {
              const s3Url = `https://${process.env.REACT_APP_AWS_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/${data[0].file_key}`;
              setImageUrl(s3Url);
            }
          } else {
            setError("Document not found");
          }
        } else if (response.status === 401) {
          setError("Authentication error");
          navigate("/login");
        } else {
          setError("Failed to load document");
          }
        } catch (error) {
        if (isMounted) {
          console.error("Error fetching document:", error);
          setError("An unexpected error occurred");
        }
        } finally {
        if (isMounted) {
          setLoading(false);
        }
        }
      };

      fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [name, navigate, token, documents]); // Removed imageUrl from dependencies

  const handleBack = () => {
    navigate("/gallery");
  };

  const handleQuantityEdit = (gtin: string, currentQuantity: string) => {
    setEditing({
      isEditing: true,
      gtin,
      value: currentQuantity
    });
  };

  const handleQuantitySave = async (gtin: string) => {
    if (!name) return;

    const newQuantity = parseInt(editing.value);
    if (isNaN(newQuantity) || newQuantity < 1) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid number greater than 0.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/document/${encodeURIComponent(name)}/sticker/${gtin}/quantity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity }),
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const updatedSticker = await response.json();
      
      // Update the document state with the new quantity
      if (document) {
        setDocument(document.map(doc => 
          doc.gtin === gtin ? { ...doc, quantity: newQuantity.toString() } : doc
        ));
      }

      setEditing({ isEditing: false, gtin: null, value: "" });
      
      toast({
        title: "Quantity updated",
        description: "The sticker quantity has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Update failed",
        description: "Failed to update the quantity. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuantityCancel = () => {
    setEditing({ isEditing: false, gtin: null, value: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bsc-lightgray">
        <div className="p-4 text-lg">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bsc-lightgray">
        <div className="p-4 text-lg text-red-600">{error}</div>
        <Button
          variant="secondary"
          onClick={handleBack}
          className="mt-4"
        >
          Back to Gallery
        </Button>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bsc-lightgray">
        <div className="p-4 text-lg">Document not found!</div>
        <Button
          variant="secondary"
          onClick={handleBack}
          className="mt-4"
        >
          Back to Gallery
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container flex items-center h-16 px-4 mx-auto sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center flex-1">
            <h1 className="text-lg font-semibold truncate">
              {name ? decodeURIComponent(name) : "Document"}
            </h1>
          </div>
        </div>
      </header>

      <main className="container p-4 mx-auto">
        <div className="grid gap-4 md:grid-cols-2 md:h-[calc(100vh-8rem)]">
          {/* Original Image */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="mb-4 text-lg font-semibold">Original Document</h3>
            <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Original document"
                  className="max-w-full max-h-[calc(100vh-16rem)] object-contain"
                  onError={() => {
                    console.error("Error loading image");
                    setImageUrl(null);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Stickers */}
          <div className="p-4 bg-white rounded-lg shadow md:overflow-hidden md:flex md:flex-col">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold">Extracted Stickers</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The stickers are typically extracted top to bottom.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-4 md:flex-1 md:overflow-y-auto">
              {document.map((doc, index) => (
                <div key={doc.gtin} className="p-4 border rounded-lg">
                  <h4 className="mb-4 font-medium text-bsc-blue">{`Sticker ${index + 1}`}</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="space-y-3">
                <p className="text-gray-700">
                  <strong>Brand:</strong> {doc.brand}
                </p>
                <p className="text-gray-700">
                  <strong>GTIN:</strong> {doc.gtin}
                </p>
                <p className="text-gray-700">
                  <strong>Lot:</strong> {doc.lot}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-700">
                    <strong>Quantity:</strong>{" "}
                    {editing.isEditing && editing.gtin === doc.gtin ? (
                      <div className="flex items-center mt-1 space-x-2">
                        <Input
                          type="number"
                          value={editing.value}
                          onChange={(e) => setEditing(prev => ({ ...prev, value: e.target.value }))}
                          className="w-24"
                          min="1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleQuantitySave(doc.gtin)}
                          className="h-8 w-8"
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleQuantityCancel}
                          className="h-8 w-8"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {doc.quantity}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleQuantityEdit(doc.gtin, doc.quantity)}
                          className="h-6 w-6 ml-2"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </p>
                </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        <strong>Item:</strong> {doc.item}
                      </p>
                      <p className="text-gray-700">
                        <strong>Dimensions:</strong> {doc.dimensions}
                </p>
                <p className="text-gray-700">
                        <strong>Reference:</strong> {doc.ref}
                </p>
                    </div>
                  </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;

