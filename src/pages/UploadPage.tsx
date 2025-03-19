
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Upload } from "lucide-react";
import { useDocuments } from "@/context/DocumentContext";
import { useToast } from "@/components/ui/use-toast";

const UploadPage = () => {
  const navigate = useNavigate();
  const { addNewDocument } = useDocuments();
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Generate a default name from the file name
      const defaultName = file.name.split('.')[0];
      setDocumentName(defaultName);
      
      // Create a preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
  
  const handleUpload = () => {
    if (selectedFile && documentName) {
      // In a real app, this would upload to a server
      // For now we'll just use the preview URL
      const newDocument = addNewDocument(documentName, previewUrl || "");
      
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded.",
      });
      
      // Navigate to gallery
      navigate("/");
    } else {
      toast({
        title: "Upload failed",
        description: "Please select a file and provide a name.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-bsc-lightgray">
      <Navbar showSearch={false} />
      
      <main className="container p-4 mx-auto">
        <div className="max-w-md p-6 mx-auto mt-8 bg-white rounded-lg shadow-md">
          <h2 className="mb-6 text-2xl font-bold text-center text-bsc-blue">Upload Document</h2>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">Document Name</label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-bsc-blue"
              placeholder="Enter document name"
            />
          </div>
          
          <div className="mb-6">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="object-contain w-full h-48 border rounded"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute p-1 bg-white rounded-full shadow-md top-2 right-2"
                >
                  <span className="text-red-500">✕</span>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded cursor-pointer border-bsc-blue bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-10 h-10 mb-3 text-bsc-blue" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 10MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>
          
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !documentName}
            className="w-full bg-bsc-blue hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
