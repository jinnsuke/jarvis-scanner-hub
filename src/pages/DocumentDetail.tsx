
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const DocumentDetail = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<any[] | null>(null); // Expecting an array now
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (name) {
      console.log("Fetching document with name:", name); // Log to check document name
      const fetchDocument = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/document/${name}`);
          console.log("API Response Status:", response.status);
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched Document Data:", data); // Log the full document data
            if (data && data.length > 0) {
              setDocument(data); // Set the full array of documents
            }
          } else {
            console.error("Document not found");
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching document:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDocument();
    }
  }, [name, navigate]);

  if (loading) {
    return <div className="p-4">Loading document...</div>;
  }

  if (!document) {
    return <div className="p-4">Document not found!</div>;
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
            <h1 className="text-lg font-semibold truncate">{name ? decodeURIComponent(name) : "Document"}</h1>
          </div>
        </div>
      </header>

      <main className="container p-4 mx-auto">
        {/* Display the document image */}
        <div className="mb-6 flex justify-center">
          <img 
            src={`http://localhost:3000/api/images/${name}`} 
            alt={name ? decodeURIComponent(name) : "Document image"} 
            className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
          />
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold">Extracted Stickers</h3>
          <div className="space-y-4">
            {document.map((doc, index) => (
              <div key={doc.gtin}>
                <h4 className="font-medium">{`Sticker ${index + 1}:`}</h4>
                <p className="text-gray-700">
                  <strong>Brand:</strong> {doc.brand}
                </p>
                <p className="text-gray-700">
                  <strong>Item:</strong> {doc.item}
                </p>
                <p className="text-gray-700">
                  <strong>GTIN:</strong> {doc.gtin}
                </p>
                <p className="text-gray-700">
                  <strong>Dimensions:</strong> {doc.dimensions}
                </p>
                <p className="text-gray-700">
                  <strong>Lot:</strong> {doc.lot}
                </p>
                <hr className="my-4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
