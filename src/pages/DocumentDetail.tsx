import { useParams, useNavigate } from "react-router-dom";  // For getting URL params and navigating
import { ArrowLeft } from "lucide-react";  // Left arrow icon for navigation
import { Button } from "@/components/ui/button";  // Button component for UI
import { useState, useEffect } from "react";  // React hooks for state and effects

const DocumentDetail = () => {
  const { name } = useParams<{ name: string }>();  // Get the document name from the URL
  const navigate = useNavigate();  // Initialize navigate function for route navigation
  
  const [document, setDocument] = useState<any | null>(null);  // State to store document data
  const [loading, setLoading] = useState<boolean>(true);  // Track loading state

  // Log the document name to verify it's correct
  console.log("Document Name from URL:", name);

  useEffect(() => {
    if (name) {
      // Fetch the document by name from the backend
      const fetchDocument = async () => {
        try {
          console.log("Fetching document with name:", name);  // Log the fetch process
          const response = await fetch(`http://localhost:3000/api/document/${name}`);
          
          // Log the API response status
          console.log("API Response Status:", response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Fetched Document Data:", data);  // Log the fetched data
            setDocument(data);  // Set the document data to state
          } else {
            console.error("Document not found, response not OK");
            navigate("/");  // Redirect to the homepage if document not found
          }
        } catch (error) {
          console.error("Error fetching document:", error);  // Log any fetch errors
        } finally {
          setLoading(false);  // Set loading to false after fetch attempt
        }
      };

      fetchDocument();  // Call the fetch function
    }
  }, [name, navigate]);  // Run effect when `name` or `navigate` changes

  if (loading) {
    console.log("Loading document...");  // Log when still loading
    return <div className="p-4">Loading...</div>;  // Show loading message
  }

  if (!document) {
    console.log("Document not found!");  // Log if document data is not found
    return <div className="p-4">Document not found!</div>;  // Show message if document is missing
  }

  console.log("Document details:", document);  // Log the document details before rendering

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
            <h1 className="text-lg font-semibold truncate">{document.name}</h1>
          </div>
        </div>
      </header>
      
      <main className="container p-4 mx-auto">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="mb-4 overflow-hidden rounded-lg">
            <img 
              src={document.imageSrc} 
              alt={document.name}
              className="object-contain w-full max-h-96"
            />
          </div>
          
          <div className="p-4 mt-4 bg-gray-50 rounded-lg">
            <h3 className="mb-2 text-lg font-medium">Extracted Text</h3>
            <p className="text-gray-700">{document.extractedText || "No text extracted from this document."}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDetail;
